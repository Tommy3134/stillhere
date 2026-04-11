import { NextRequest, NextResponse } from 'next/server'
import { createSpiritSchema, updateSpiritSharingSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { createSignedPhotoUrls } from '@/lib/storage'

async function withSignedPhotoUrls<T extends { photoUrls: string[] }>(spirit: T) {
  return {
    ...spirit,
    photoUrls: await createSignedPhotoUrls(spirit.photoUrls),
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const user = await getAuthUser(req.headers.get('authorization'))

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (id) {
      const spirit = await prisma.spirit.findFirst({
        where: { id, userId: user.id },
        include: {
          statuses: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      })
      if (!spirit) {
        return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
      }

      return NextResponse.json({
        spirit: await withSignedPhotoUrls(spirit),
      })
    }

    const spirits = await prisma.spirit.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        statuses: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })
    return NextResponse.json({
      spirits: await Promise.all(
        spirits.map((spirit) => withSignedPhotoUrls(spirit))
      ),
    })
  } catch (error) {
    console.error('Get spirit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createSpiritSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, spiritType, personality, homeStyle, photoUrls } = parsed.data

    const authUser = await getAuthUser(req.headers.get('authorization'))
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const spirit = await prisma.spirit.create({
      data: {
        userId: authUser.id,
        name,
        spiritType,
        personality: JSON.parse(JSON.stringify(personality)),
        photoUrls: photoUrls || [],
        homeStyle,
      },
    })

    // 创建初始状态
    await prisma.spiritStatus.create({
      data: {
        spiritId: spirit.id,
        content: '纪念空间刚刚建立，你可以继续补充和它有关的回忆。',
        mood: 'content',
      },
    })

    return NextResponse.json({ spirit }, { status: 201 })
  } catch (error) {
    console.error('Create spirit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    if (typeof body?.shareEnabled === 'boolean') {
      const parsed = updateSpiritSharingSchema.safeParse(body)

      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid input', details: parsed.error.flatten() },
          { status: 400 }
        )
      }

      const existingSpirit = await prisma.spirit.findFirst({
        where: { id: parsed.data.id, userId: user.id },
        select: { id: true },
      })

      if (!existingSpirit) {
        return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
      }

      const spirit = await prisma.spirit.update({
        where: { id: existingSpirit.id },
        data: { shareEnabled: parsed.data.shareEnabled },
        select: { id: true, shareEnabled: true },
      })

      return NextResponse.json({
        spirit,
        shareUrl: spirit.shareEnabled ? `/share/${spirit.id}` : null,
      })
    }

    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  } catch (error) {
    console.error('Update sharing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
