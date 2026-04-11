import { NextRequest, NextResponse } from 'next/server'
import { blessSchema } from '@/lib/validations'
import { BLESSING_ITEMS } from '@/lib/constants'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = blessSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { spiritId, blessingType } = parsed.data
    const item = BLESSING_ITEMS[blessingType as keyof typeof BLESSING_ITEMS]

    if (!item) {
      return NextResponse.json({ error: 'Invalid blessing type' }, { status: 400 })
    }

    const spirit = await prisma.spirit.findUnique({ where: { id: spiritId, userId: user.id } })
    if (!spirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
    }

    const blessing = await prisma.blessing.create({
      data: {
        spiritId,
        userId: user.id,
        blessingType,
        amount: item.priceCny,
      },
    })

    return NextResponse.json({ blessing }, { status: 201 })
  } catch (error) {
    console.error('Bless error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    const spirit = await prisma.spirit.findUnique({
      where: { id: spiritId, userId: user.id },
      select: { id: true },
    })

    if (!spirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
    }

    const blessings = await prisma.blessing.findMany({
      where: { spiritId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: { select: { displayName: true } } },
    })

    const count = await prisma.blessing.count({ where: { spiritId } })

    return NextResponse.json({ blessings, count })
  } catch (error) {
    console.error('Get blessings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
