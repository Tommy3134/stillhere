import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { shouldUseLocalDevStore } from '@/lib/database-health'
import { getLocalSpiritStatuses } from '@/lib/local-dev-store'
import { sanitizeStatusRecord } from '@/lib/status-guardrails'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const spiritId = req.nextUrl.searchParams.get('spiritId')

    if (!spiritId) {
      return NextResponse.json({ error: 'spiritId required' }, { status: 400 })
    }

    if (await shouldUseLocalDevStore()) {
      const statuses = await getLocalSpiritStatuses(user.id, spiritId)

      if (!statuses) {
        return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
      }

      const safeStatuses = statuses.map((status) => sanitizeStatusRecord(status))

      const current = safeStatuses[0]
        ? {
            content: safeStatuses[0].content,
            mood: safeStatuses[0].mood,
            time: new Intl.DateTimeFormat('zh-CN', {
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(safeStatuses[0].createdAt)),
          }
        : { content: '在纪念空间里安静待着', mood: 'content', time: '刚刚' }

      return NextResponse.json({
        current,
        recent: safeStatuses.map((status) => ({
          id: status.id,
          content: status.content,
          mood: status.mood,
          time: new Intl.DateTimeFormat('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(status.createdAt)),
        })),
      })
    }

    const spirit = await prisma.spirit.findUnique({
      where: { id: spiritId, userId: user.id },
      select: { id: true, name: true },
    })

    if (!spirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
    }

    const statuses = await prisma.spiritStatus.findMany({
      where: { spiritId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, content: true, mood: true, createdAt: true },
    })

    const safeStatuses = statuses.map((status) => sanitizeStatusRecord(status))

    const current = safeStatuses[0]
      ? {
          content: safeStatuses[0].content,
          mood: safeStatuses[0].mood,
          time: new Intl.DateTimeFormat('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(safeStatuses[0].createdAt)),
        }
      : { content: '在纪念空间里安静待着', mood: 'content', time: '刚刚' }

    return NextResponse.json({
      current,
      recent: safeStatuses.map((status) => ({
        id: status.id,
        content: status.content,
        mood: status.mood,
        time: new Intl.DateTimeFormat('zh-CN', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(status.createdAt)),
      })),
    })
  } catch (error) {
    console.error('Get status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Manual status generation is disabled. Use the scheduled /api/status/generate route instead.' },
    { status: 405 }
  )
}
