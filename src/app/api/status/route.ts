import { NextRequest, NextResponse } from 'next/server'
import { buildStatusPrompt, inferMood } from '@/lib/ai-engine'

// 临时状态存储
const statusStore = new Map<string, Array<{ content: string; mood: string; time: string }>>()

// 初始化模拟数据
statusStore.set('mock-spirit-1', [
  { content: '窝在沙发上打盹', mood: 'sleepy', time: '10:30' },
  { content: '去隔壁找花花玩了一会儿', mood: 'playful', time: '09:15' },
  { content: '起床，伸了个大懒腰', mood: 'content', time: '08:00' },
  { content: '梦到了好吃的小鱼干', mood: 'happy', time: '07:30' },
])

export async function GET(req: NextRequest) {
  const spiritId = req.nextUrl.searchParams.get('spiritId')

  if (!spiritId) {
    return NextResponse.json({ error: 'spiritId required' }, { status: 400 })
  }

  const statuses = statusStore.get(spiritId) || statusStore.get('mock-spirit-1') || []
  const current = statuses[0] || { content: '在新家里探索中...', mood: 'curious', time: '刚刚' }

  return NextResponse.json({
    current,
    recent: statuses.slice(0, 10),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { spiritId } = await req.json()

    // TODO: 从数据库获取分身信息
    const spirit = {
      name: '史小圆',
      spiritType: 'pet_cat' as const,
      personality: {
        tags: ['贪吃', '好奇', '粘人', '胆小'],
        habits: '喜欢吃手指、总是帮苗苗姐姐埋屎',
      },
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    let statusContent: string

    if (apiKey) {
      const prompt = buildStatusPrompt(spirit)
      const response = await fetch('https://api.anthropic.com/v1/messages', {
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
        throw new Error('AI API error')
      }

      const data = await response.json()
      statusContent = data.content[0]?.text || '在家里待着'
    } else {
      // 无API key时使用预设状态
      const presets = [
        '趴在窗台看外面的蝴蝶',
        '在厨房转悠，好像闻到了好吃的',
        '追着自己的尾巴转圈圈',
        '找到了一个纸箱子，钻进去了',
        '在阳光下翻肚皮晒太阳',
        '偷偷跑到隔壁串门去了',
      ]
      statusContent = presets[Math.floor(Math.random() * presets.length)]
    }

    const mood = inferMood(statusContent)
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    const newStatus = { content: statusContent, mood, time }

    if (!statusStore.has(spiritId)) {
      statusStore.set(spiritId, [])
    }
    statusStore.get(spiritId)!.unshift(newStatus)

    return NextResponse.json({ status: newStatus })
  } catch (error) {
    console.error('Status generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
