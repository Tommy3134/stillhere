import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildStatusPrompt, inferMood } from '@/lib/ai-engine'
import { SPIRIT_TYPES } from '@/lib/constants'

const FALLBACK_STATUSES = [
  '趴在窗台看外面的蝴蝶',
  '在厨房转悠，好像闻到了好吃的',
  '追着自己的尾巴转圈圈',
  '找到了一个纸箱子，钻进去了',
  '在阳光下翻肚皮晒太阳',
  '偷偷跑到隔壁串门去了',
  '窝在沙发上打盹',
  '蹲在门口等家人回来',
  '发现了一只小虫子，盯着看了半天',
  '在花园里追蝴蝶',
]

const NEIGHBOR_TEMPLATES = [
  '去隔壁找{name}玩了一会儿',
  '和{name}一起在花园里晒太阳',
  '跟{name}抢了一个纸箱子',
  '和{name}并排趴在窗台上看风景',
  '偷偷去{name}家蹭了顿饭',
  '{name}来串门了，两个小家伙玩得很开心',
]

interface PersonalityData {
  tags: string[]
  habits?: string
  funnyStory?: string
}

async function generateWithAI(
  spirit: { name: string; spiritType: string; personality: PersonalityData },
  apiKey: string,
): Promise<string> {
  const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
  const prompt = buildStatusPrompt({
    name: spirit.name,
    spiritType: spirit.spiritType as keyof typeof SPIRIT_TYPES,
    personality: spirit.personality,
  })

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => 'unknown')
    throw new Error(`AI API error ${response.status}: ${errText}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text?.trim() || ''
}

function pickFallback(neighbors?: string[]): string {
  // 30%概率生成邻居互动状态
  if (neighbors && neighbors.length > 0 && Math.random() < 0.3) {
    const template = NEIGHBOR_TEMPLATES[Math.floor(Math.random() * NEIGHBOR_TEMPLATES.length)]
    const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)]
    return template.replace('{name}', neighbor)
  }
  return FALLBACK_STATUSES[Math.floor(Math.random() * FALLBACK_STATUSES.length)]
}

export async function GET() {
  return handleGenerate()
}

export async function POST() {
  return handleGenerate()
}

async function handleGenerate() {
  try {
    const spirits = await prisma.spirit.findMany({
      where: { isActive: true },
      select: { id: true, name: true, spiritType: true, personality: true, homeStyle: true },
    })

    if (spirits.length === 0) {
      return NextResponse.json({ generated: 0, message: 'No active spirits' })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    const results: Array<{ spiritId: string; content: string; mood: string }> = []

    for (const spirit of spirits) {
      let content: string
      const personality = spirit.personality as unknown as PersonalityData & { birthday?: string; passedDate?: string }

      // 检查特殊日期
      const today = new Date()
      const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
      const isBirthday = personality.birthday && personality.birthday.slice(5) === mmdd
      const isMemorialDay = personality.passedDate && personality.passedDate.slice(5) === mmdd

      if (isBirthday) {
        content = `今天是${spirit.name}的生日！在彼岸世界收到了好多祝福，开心地转圈圈`
        const mood = 'happy'
        await prisma.spiritStatus.create({ data: { spiritId: spirit.id, content, mood } })
        results.push({ spiritId: spirit.id, content, mood })
        continue
      }

      if (isMemorialDay) {
        content = `今天是特别的日子。${spirit.name}安静地坐在窗边，望着远方，好像在等谁回来`
        const mood = 'content'
        await prisma.spiritStatus.create({ data: { spiritId: spirit.id, content, mood } })
        results.push({ spiritId: spirit.id, content, mood })
        continue
      }

      // 查找邻居（同homeStyle的其他分身）
      const neighbors = spirits
        .filter(s => s.id !== spirit.id && s.homeStyle === spirit.homeStyle)
        .map(s => s.name)

      if (apiKey) {
        try {
          content = await generateWithAI(
            {
              name: spirit.name,
              spiritType: spirit.spiritType,
              personality: spirit.personality as unknown as PersonalityData,
            },
            apiKey,
          )
          if (!content) content = pickFallback(neighbors)
        } catch (err) {
          console.error(`AI generation failed for spirit ${spirit.id}:`, err)
          content = pickFallback(neighbors)
        }
      } else {
        content = pickFallback(neighbors)
      }

      const mood = inferMood(content)

      await prisma.spiritStatus.create({
        data: {
          spiritId: spirit.id,
          content,
          mood,
        },
      })

      results.push({ spiritId: spirit.id, content, mood })
    }

    return NextResponse.json({ generated: results.length, results })
  } catch (error) {
    console.error('Status generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
