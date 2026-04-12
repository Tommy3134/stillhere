import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { buildStatusPrompt, inferMood } from '@/lib/ai-engine'
import { SPIRIT_TYPES } from '@/lib/constants'
import { isAuthorizedCronRequest } from '@/lib/cron'
import { shouldUseLocalDevStore } from '@/lib/database-health'
import { sanitizeStatusContent } from '@/lib/status-guardrails'
import {
  createLocalSpiritMessage,
  createLocalSpiritStatus,
  listAllLocalActiveSpirits,
} from '@/lib/local-dev-store'

const FALLBACK_STATUSES: Record<string, string[]> = {
  pet_cat: [
    '趴在窗台看外面的蝴蝶',
    '在厨房转悠，好像闻到了好吃的',
    '追着自己的尾巴转圈圈',
    '找到了一个纸箱子，钻进去了',
    '在阳光下翻肚皮晒太阳',
    '窝在沙发上打盹',
    '蹲在门口等家人回来',
    '发现了一只小虫子，盯着看了半天',
    '在花园里追蝴蝶',
    '把桌上的杯子推到了边缘，看着它摇晃',
  ],
  pet_dog: [
    '叼着球在花园里跑来跑去',
    '趴在门口等家人回来，尾巴时不时摇一下',
    '在草地上打滚，开心得不行',
    '闻到了好吃的味道，鼻子一直动',
    '和邻居家的狗隔着篱笆对望',
    '在阳光下伸了个大懒腰',
    '把骨头埋在花园里，然后忘了埋在哪',
    '听到什么声音，竖起耳朵警觉地看',
    '在沙发上占了最好的位置，不肯让',
    '梦里跑步，爪子在动',
  ],
  pet_other: [
    '安静地待在自己的小窝里',
    '好奇地看着窗外的风景',
    '在角落里找到了好玩的东西',
    '吃完饭满足地眯起了眼睛',
    '在熟悉的小角落里慢慢转悠',
    '和新朋友一起晒太阳',
  ],
  human: [
    '在花园里散步，看着远处的山',
    '坐在窗边看书，偶尔抬头看看天',
    '在厨房里做了一道拿手菜',
    '和邻居聊了会儿天，笑了好几次',
    '整理了一下房间，把照片摆得整整齐齐',
    '在阳台上喝茶，看夕阳',
  ],
}

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
  birthday?: string
  passedDate?: string
}

interface SpiritGenerationInput {
  id: string
  userId: string
  name: string
  spiritType: string
  personality: PersonalityData
  homeStyle: string
}

async function generateWithAI(
  spirit: { name: string; spiritType: string; personality: PersonalityData },
  apiKey: string,
): Promise<string> {
  // NOTE: ANTHROPIC_BASE_URL must point to api.anthropic.com in production. Changing to a third-party proxy voids the "不训练" promise in the site footer.
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

function getMissMessage(name: string, spiritType: string, tags: string[]): string {
  const catMessages = [
    '你不在的时候，我趴在窗台上看了好久外面...',
    '今天梦到你了，醒来发现你不在，有点失落',
    '我把你上次给我的毛线球藏好了，等你来找',
    '隔壁的猫说它主人今天来看它了，我也想你来',
  ]
  const dogMessages = [
    '我在门口等了好久，你什么时候来看我呀',
    '今天闻到一个味道好像你，结果不是...',
    '我把你最喜欢的球叼到门口了，等你来玩',
    '尾巴今天摇了好多次，因为一直在想你',
  ]
  const humanMessages = [
    '今天天气很好，想起以前我们一起散步的日子',
    '做了你爱吃的菜，可惜你不在',
    '看到一本书想推荐给你，有空来聊聊',
    '这边一切都好，不用担心我',
  ]
  const defaultMessages = [
    '想你了，什么时候来看看我呀',
    '今天过得还好，就是有点想你',
    '你不来的时候我也过得很好哦，不过还是想你',
  ]

  if (tags.includes('粘人')) return '你怎么还不来看我...我好想你啊'
  if (tags.includes('霸道')) return '哼，你是不是把我忘了？快来！'
  if (tags.includes('独立')) return '嗯...偶尔也会想你一下'

  const pool = spiritType === 'pet_cat'
    ? catMessages
    : spiritType === 'pet_dog'
      ? dogMessages
      : spiritType === 'human'
        ? humanMessages
        : defaultMessages

  return pool[Math.floor(Math.random() * pool.length)]
}

function pickFallback(spiritType: string, neighbors?: string[]): string {
  if (neighbors && neighbors.length > 0 && Math.random() < 0.3) {
    const template = NEIGHBOR_TEMPLATES[Math.floor(Math.random() * NEIGHBOR_TEMPLATES.length)]
    const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)]
    return template.replace('{name}', neighbor)
  }

  const pool = FALLBACK_STATUSES[spiritType] || FALLBACK_STATUSES.pet_other
  return pool[Math.floor(Math.random() * pool.length)]
}

async function generateStatusesForSpirits(
  spirits: SpiritGenerationInput[],
  options: {
    createStatus: (input: { spiritId: string; content: string; mood: string }) => Promise<void>
    createSpiritMessage?: (input: { spiritId: string; userId: string; content: string }) => Promise<void>
  }
) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const results: Array<{ spiritId: string; content: string; mood: string }> = []

  for (const spirit of spirits) {
    let content: string
    const personality = spirit.personality

    const today = new Date()
    const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const isBirthday = personality.birthday && personality.birthday.slice(5) === mmdd
    const isMemorialDay = personality.passedDate && personality.passedDate.slice(5) === mmdd

    if (isBirthday) {
      content = `今天是${spirit.name}的生日，你留下的这些回忆显得格外明亮`
      const mood = 'happy'
      await options.createStatus({ spiritId: spirit.id, content, mood })
      results.push({ spiritId: spirit.id, content, mood })
      continue
    }

    if (isMemorialDay) {
      content = `今天是特别的日子。${spirit.name}安静地坐在窗边，望着远方，好像在等谁回来`
      const mood = 'content'
      await options.createStatus({ spiritId: spirit.id, content, mood })
      results.push({ spiritId: spirit.id, content, mood })
      continue
    }

    const neighbors = spirits
      .filter((item) => item.id !== spirit.id && item.homeStyle === spirit.homeStyle)
      .map((item) => item.name)
    const fallbackContent = pickFallback(spirit.spiritType, neighbors)

    if (apiKey) {
      try {
        const aiContent = await generateWithAI(
          {
            name: spirit.name,
            spiritType: spirit.spiritType,
            personality,
          },
          apiKey,
        )
        content = sanitizeStatusContent(aiContent, fallbackContent)
      } catch (err) {
        console.error(`AI generation failed for spirit ${spirit.id}:`, err)
        content = fallbackContent
      }
    } else {
      content = fallbackContent
    }

    content = sanitizeStatusContent(content, fallbackContent)
    const mood = inferMood(content)
    await options.createStatus({ spiritId: spirit.id, content, mood })

    if (options.createSpiritMessage && Math.random() < 0.2) {
      const missMessages = getMissMessage(spirit.name, spirit.spiritType, personality.tags)
      await options.createSpiritMessage({
        spiritId: spirit.id,
        userId: spirit.userId,
        content: missMessages,
      })
    }

    results.push({ spiritId: spirit.id, content, mood })
  }

  return results
}

export async function GET(req: NextRequest) {
  return handleGenerate(req)
}

export async function POST(req: NextRequest) {
  return handleGenerate(req)
}

async function handleGenerate(req: NextRequest) {
  try {
    if (!isAuthorizedCronRequest(req)) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
    }

    if (await shouldUseLocalDevStore()) {
      const spirits = (await listAllLocalActiveSpirits()).map((spirit) => ({
        ...spirit,
        personality: spirit.personality as unknown as PersonalityData,
      }))

      if (spirits.length === 0) {
        return NextResponse.json({ generated: 0, message: 'No active spirits', storage: 'local-dev-store' })
      }

      const results = await generateStatusesForSpirits(spirits, {
        createStatus: async ({ spiritId, content, mood }) => {
          await createLocalSpiritStatus({ spiritId, content, mood })
        },
        createSpiritMessage: async ({ spiritId, userId, content }) => {
          await createLocalSpiritMessage({ spiritId, userId, role: 'spirit', content })
        },
      })

      return NextResponse.json({ generated: results.length, results, storage: 'local-dev-store' })
    }

    const spirits = await prisma.spirit.findMany({
      where: { isActive: true },
      select: { id: true, userId: true, name: true, spiritType: true, personality: true, homeStyle: true },
    })

    if (spirits.length === 0) {
      return NextResponse.json({ generated: 0, message: 'No active spirits' })
    }

    const results = await generateStatusesForSpirits(
      spirits.map((spirit) => ({
        ...spirit,
        personality: spirit.personality as unknown as PersonalityData,
      })),
      {
        createStatus: async ({ spiritId, content, mood }) => {
          await prisma.spiritStatus.create({
            data: { spiritId, content, mood },
          })
        },
        createSpiritMessage: async ({ spiritId, userId, content }) => {
          await prisma.message.create({
            data: {
              spiritId,
              userId,
              role: 'spirit',
              content,
            },
          })
        },
      }
    )

    return NextResponse.json({ generated: results.length, results })
  } catch (error) {
    console.error('Status generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
