import { NextRequest } from 'next/server'
import { sendMessageSchema } from '@/lib/validations'
import { buildSpiritSystemPrompt } from '@/lib/ai-engine'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { extractMemory, buildMemoryContext } from '@/lib/memory'
import { getAuthUser } from '@/lib/auth'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const { searchParams } = new URL(req.url)
    const spiritId = searchParams.get('spiritId')
    if (!spiritId) {
      return jsonResponse({ error: 'Missing spiritId' }, 400)
    }

    const spirit = await prisma.spirit.findUnique({
      where: { id: spiritId, userId: user.id },
      select: { id: true },
    })
    if (!spirit) {
      return jsonResponse({ error: 'Spirit not found' }, 404)
    }

    const messages = await prisma.message.findMany({
      where: { spiritId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, role: true, content: true, createdAt: true },
    })
    return jsonResponse({ messages: messages.reverse() })
  } catch (error) {
    console.error('Get chat history error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const body = await req.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return jsonResponse({ error: 'Invalid input', details: parsed.error.flatten() }, 400)
    }

    const { spiritId, content } = parsed.data

    const spirit = await prisma.spirit.findUnique({ where: { id: spiritId, userId: user.id } })
    if (!spirit) {
      return jsonResponse({ error: 'Spirit not found' }, 404)
    }

    const personality = spirit.personality as { tags: string[]; habits?: string; funnyStory?: string; memory?: Record<string, unknown> }
    const memoryContext = buildMemoryContext(personality.memory as Parameters<typeof buildMemoryContext>[0])
    const systemPrompt = buildSpiritSystemPrompt({
      name: spirit.name,
      spiritType: spirit.spiritType as 'pet_cat' | 'pet_dog' | 'pet_other' | 'human',
      personality,
    }) + memoryContext

    // 保存用户消息到数据库
    await prisma.message.create({
      data: { spiritId, userId: user.id, role: 'user', content },
    })

    // 获取最近20条对话历史
    const history = await prisma.message.findMany({
      where: { spiritId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    const recentHistory = history.reverse()

    // 调用AI API
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // 没有API key时返回模拟回复
      const mockReply = getMockReply(personality.tags)
      await prisma.message.create({
        data: { spiritId, userId: user.id, role: 'spirit', content: mockReply },
      })
      return jsonResponse({ message: mockReply, spiritId })
    }

    // 使用Claude API（SSE流式）
    const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: systemPrompt,
        messages: recentHistory.map((msg: { role: string; content: string }) => ({
          role: msg.role === 'spirit' ? 'assistant' : 'user',
          content: msg.content,
        })),
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 转发SSE流
    const encoder = new TextEncoder()
    let fullReply = ''
    const userId = user.id
    const sid = spiritId

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue
                try {
                  const parsed = JSON.parse(data)
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    fullReply += parsed.delta.text
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
                    )
                  }
                } catch {
                  // 忽略解析错误
                }
              }
            }
          }

          // 保存完整回复到数据库
          await prisma.message.create({
            data: { spiritId: sid, userId, role: 'spirit', content: fullReply },
          })

          // 异步提取记忆，不阻塞响应
          const memMessages = recentHistory
            .map((msg: { role: string; content: string }) => ({ role: msg.role, content: msg.content }))
            .concat([{ role: 'spirit', content: fullReply }])
          extractMemory(memMessages, personality.memory as Parameters<typeof extractMemory>[1])
            .then(async (newMemory) => {
              try {
                const updatedPersonality = { ...personality, memory: newMemory }
                await prisma.spirit.update({
                  where: { id: sid },
                  data: { personality: updatedPersonality as unknown as Prisma.InputJsonValue },
                })
              } catch (e) {
                console.error('Memory save failed:', e)
              }
            })
            .catch((e) => console.error('Memory extraction error:', e))

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}

function getMockReply(tags: string[]): string {
  const replies: Record<string, string[]> = {
    '贪吃': ['今天闻到隔壁飘来好香的味道，馋死我了~', '你有没有带好吃的来看我呀？'],
    '粘人': ['你来啦！我好想你~', '你怎么才来，我等了好久好久'],
    '好奇': ['今天发现了一个新地方，好好玩！', '隔壁新来了一只橘猫，我去看看它'],
    '胆小': ['刚才打雷了，不过我没有害怕哦...好吧有一点点', '这里很安全，我不害怕了'],
    '调皮': ['嘿嘿，我刚才把隔壁的花盆推倒了', '我今天学会了一个新技能！才不告诉你'],
  }
  for (const tag of tags) {
    if (replies[tag]) {
      return replies[tag][Math.floor(Math.random() * replies[tag].length)]
    }
  }
  return '喵~ 你来看我啦，好开心！'
}
