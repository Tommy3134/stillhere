import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const timestamp = new Date().toISOString()

    // 存到Vercel日志（可在Vercel Dashboard查看）
    console.log('=== FEEDBACK ===', timestamp, JSON.stringify(data))

    // 同时写入一个简单的文本格式方便查看
    const lines = [
      `--- Feedback ${timestamp} ---`,
      `Who: ${data.who || '-'}`,
      `Feeling: ${data.feeling || '-'}`,
      `Comeback: ${data.comeback || '-'}`,
      `Feature: ${data.feature || '-'}`,
      `Wanted: ${data.wanted || '-'}`,
      `Price: ${data.price || '-'}`,
      `Share: ${data.share || '-'}`,
      `Other: ${data.other || '-'}`,
    ]
    console.log(lines.join('\n'))

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}
