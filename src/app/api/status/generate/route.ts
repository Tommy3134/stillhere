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
  '去隔壁找花花玩了一会儿',
  '蹲在门口等家人回来',
  '发现了一只小虫子，盯着看了半天',
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

function pickFallback(): string {
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
      select: { id: true, name: true, spiritType: true, personality: true },
    })

    if (spirits.length === 0) {
      return NextResponse.json({ generated: 0, message: 'No active spirits' })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    const results: Array<{ spiritId: string; content: string; mood: string }> = []

    for (const spirit of spirits) {
      let content: string

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
          if (!content) content = pickFallback()
        } catch (err) {
          console.error(`AI generation failed for spirit ${spirit.id}:`, err)
          content = pickFallback()
        }
      } else {
        content = pickFallback()
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
