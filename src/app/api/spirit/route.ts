import { NextRequest, NextResponse } from 'next/server'
import { createSpiritSchema, updateSpiritDetailsSchema, updateSpiritSharingSchema } from '@/lib/validations'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { createSignedPhotoUrls, deleteStorageFiles } from '@/lib/storage'
import { shouldUseLocalDevStore } from '@/lib/database-health'
import { sanitizeStatusRecord } from '@/lib/status-guardrails'
import { deleteLocalFeedbackSubmissionsBySpiritId } from '@/lib/local-feedback-store'
import {
  createLocalSpirit,
  deleteLocalSpirit,
  getLocalSpirit,
  listLocalSpirits,
  updateLocalSpiritDetails,
  updateLocalSpiritSharing,
} from '@/lib/local-dev-store'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const user = await getAuthUser(req.headers.get('authorization'))

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (await shouldUseLocalDevStore()) {
      if (id) {
        const spirit = await getLocalSpirit(user.id, id)
        if (!spirit) {
          return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
        }

        return NextResponse.json({
          spirit: {
            ...spirit,
            statuses: spirit.statuses.map((status) => sanitizeStatusRecord(status)),
            photoRefs: spirit.photoUrls,
            photoUrls: await createSignedPhotoUrls(spirit.photoUrls),
          },
        })
      }

      const spirits = await listLocalSpirits(user.id)
      return NextResponse.json({
        spirits: await Promise.all(
          spirits.map(async (spirit) => ({
            ...spirit,
            statuses: spirit.statuses.map((status) => sanitizeStatusRecord(status)),
            photoRefs: spirit.photoUrls,
            photoUrls: await createSignedPhotoUrls(spirit.photoUrls),
          }))
        ),
      })
    }

    if (id) {
      const spirit = await prisma.spirit.findUnique({
        where: { id, userId: user.id },
        include: {
          statuses: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      })
      if (!spirit) {
        return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
      }

      return NextResponse.json({
        spirit: {
          ...spirit,
          statuses: spirit.statuses.map((status) => sanitizeStatusRecord(status)),
          photoRefs: spirit.photoUrls,
          photoUrls: await createSignedPhotoUrls(spirit.photoUrls),
        },
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
        spirits.map(async (spirit) => ({
          ...spirit,
          statuses: spirit.statuses.map((status) => sanitizeStatusRecord(status)),
          photoRefs: spirit.photoUrls,
          photoUrls: await createSignedPhotoUrls(spirit.photoUrls),
        }))
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

    if (await shouldUseLocalDevStore()) {
      const spirit = await createLocalSpirit({
        userId: authUser.id,
        name,
        spiritType,
        personality: JSON.parse(JSON.stringify(personality)),
        homeStyle,
        photoUrls: photoUrls || [],
      })

      return NextResponse.json({ spirit }, { status: 201 })
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

      if (await shouldUseLocalDevStore()) {
        const spirit = await updateLocalSpiritSharing(user.id, parsed.data.id, parsed.data.shareEnabled)

        if (!spirit) {
          return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
        }

        return NextResponse.json({
          spirit: {
            id: spirit.id,
            shareEnabled: spirit.shareEnabled,
          },
          shareUrl: spirit.shareEnabled ? `/share/${spirit.id}` : null,
        })
      }

      const existingSpirit = await prisma.spirit.findUnique({
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

    const parsed = updateSpiritDetailsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    if (await shouldUseLocalDevStore()) {
      const result = await updateLocalSpiritDetails({
        userId: user.id,
        ...parsed.data,
        personality: JSON.parse(JSON.stringify(parsed.data.personality)),
      })

      if (result.kind === 'not_found') {
        return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
      }

      if (result.kind === 'too_many_photos') {
        return NextResponse.json({ error: '最多可保存 18 张照片' }, { status: 400 })
      }

      if (parsed.data.removePhotoRefs.length > 0) {
        await deleteStorageFiles(parsed.data.removePhotoRefs)
      }

      return NextResponse.json({
        spirit: {
          ...result.spirit,
          statuses: result.spirit.statuses.map((status) => sanitizeStatusRecord(status)),
          photoRefs: result.spirit.photoUrls,
          photoUrls: await createSignedPhotoUrls(result.spirit.photoUrls),
        },
      })
    }

    const existingSpirit = await prisma.spirit.findUnique({
      where: { id: parsed.data.id, userId: user.id },
      select: { id: true, photoUrls: true },
    })

    if (!existingSpirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
    }

    const removedPhotoSet = new Set(parsed.data.removePhotoRefs)
    const keptPhotoUrls = existingSpirit.photoUrls.filter((photoUrl) => !removedPhotoSet.has(photoUrl))
    const mergedPhotoUrls = [...keptPhotoUrls, ...parsed.data.addPhotoUrls]
    if (mergedPhotoUrls.length > 18) {
      return NextResponse.json({ error: '最多可保存 18 张照片' }, { status: 400 })
    }

    const spirit = await prisma.spirit.update({
      where: { id: existingSpirit.id },
      data: {
        name: parsed.data.name,
        personality: JSON.parse(JSON.stringify(parsed.data.personality)),
        photoUrls: mergedPhotoUrls,
      },
      include: {
        statuses: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    if (parsed.data.removePhotoRefs.length > 0) {
      await deleteStorageFiles(parsed.data.removePhotoRefs)
    }

    return NextResponse.json({
      spirit: {
        ...spirit,
        statuses: spirit.statuses.map((status) => sanitizeStatusRecord(status)),
        photoRefs: spirit.photoUrls,
        photoUrls: await createSignedPhotoUrls(spirit.photoUrls),
      },
    })
  } catch (error) {
    console.error('Update sharing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing spirit id' }, { status: 400 })
    }

    if (await shouldUseLocalDevStore()) {
      const spirit = await deleteLocalSpirit(user.id, id)

      if (!spirit) {
        return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
      }

      await deleteLocalFeedbackSubmissionsBySpiritId(id)
      await deleteStorageFiles(spirit.photoUrls)
      return NextResponse.json({ success: true })
    }

    const spirit = await prisma.spirit.findUnique({
      where: { id, userId: user.id },
      select: { id: true, photoUrls: true },
    })

    if (!spirit) {
      return NextResponse.json({ error: 'Spirit not found' }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.blessing.deleteMany({ where: { spiritId: id } }),
      prisma.message.deleteMany({ where: { spiritId: id } }),
      prisma.spiritStatus.deleteMany({ where: { spiritId: id } }),
      prisma.feedbackSubmission.deleteMany({ where: { spiritId: id } }),
      prisma.spirit.delete({ where: { id } }),
    ])

    await deleteStorageFiles(spirit.photoUrls)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete spirit error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
