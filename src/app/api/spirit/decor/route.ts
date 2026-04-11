import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { spiritId, decor } = await req.json()

    if (!spiritId || !Array.isArray(decor) || decor.some((item) => typeof item !== 'string')) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const spirit = await prisma.spirit.findUnique({ where: { id: spiritId, userId: user.id } })
    if (!spirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
    }

    const personality = (spirit.personality as Record<string, unknown>) || {}
    const updated = { ...personality, decor }

    await prisma.spirit.update({
      where: { id: spiritId },
      data: { personality: updated },
    })

    return NextResponse.json({ success: true, decor: updated.decor })
  } catch (error) {
    console.error('Decor update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
