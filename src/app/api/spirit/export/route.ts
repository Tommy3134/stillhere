import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { createSignedPhotoUrls } from '@/lib/storage'
import { shouldUseLocalDevStore } from '@/lib/database-health'
import { getLocalSpiritExport } from '@/lib/local-dev-store'
import { sanitizeStatusRecord } from '@/lib/status-guardrails'

export const dynamic = 'force-dynamic'

interface ExportStatusRecord {
  id: string
  content: string
  mood: string
  createdAt: string | Date
}

interface ExportMessageRecord {
  id: string
  role: string
  content: string
  createdAt: string | Date
}

interface ExportBlessingRecord {
  id: string
  blessingType: string
  amount: number
  txHash: string | null
  createdAt: string | Date
}

interface ExportSpiritRecord {
  id: string
  name: string
  spiritType: string
  personality: unknown
  homeStyle: string
  shareEnabled: boolean
  createdAt: string | Date
  updatedAt: string | Date
  photoUrls: string[]
  statuses: ExportStatusRecord[]
  messages?: ExportMessageRecord[]
  blessings?: ExportBlessingRecord[]
}

interface MemorialProfile {
  nickname: string | null
  birthday: string | null
  passedDate: string | null
  tags: string[]
  habits: string | null
  funnyStory: string | null
}

function toSafeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
    .replace(/^-+|-+$/g, '') || 'stillhere-memorial'
}

function getMemorialProfile(personality: unknown): MemorialProfile {
  const source = personality && typeof personality === 'object'
    ? personality as Record<string, unknown>
    : {}

  return {
    nickname: typeof source.nickname === 'string' ? source.nickname : null,
    birthday: typeof source.birthday === 'string' ? source.birthday : null,
    passedDate: typeof source.passedDate === 'string' ? source.passedDate : null,
    tags: Array.isArray(source.tags)
      ? source.tags.filter((tag): tag is string => typeof tag === 'string')
      : [],
    habits: typeof source.habits === 'string' ? source.habits : null,
    funnyStory: typeof source.funnyStory === 'string' ? source.funnyStory : null,
  }
}

function buildExportPayload(
  spirit: ExportSpiritRecord,
  signedPhotoUrls: string[],
  options?: { localFallback?: boolean }
) {
  const messages = spirit.messages || []
  const blessings = spirit.blessings || []
  const memorialProfile = getMemorialProfile(spirit.personality)
  const safeStatuses = spirit.statuses.map((status) => sanitizeStatusRecord(status))

  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: '2026-04-05',
    productPhase: 'phase-1-memorial',
    exportSource: options?.localFallback ? 'local-dev-store' : 'primary-database',
    summary: {
      memorialName: spirit.name,
      visibility: spirit.shareEnabled ? 'shared-with-link' : 'private-only',
      photoCount: spirit.photoUrls.length,
      statusCount: safeStatuses.length,
      messageCount: messages.length,
      blessingCount: blessings.length,
      includesTemporaryPhotoDownloads: signedPhotoUrls.length > 0,
      latestStatusAt: safeStatuses[0]?.createdAt ?? null,
      hasNickname: Boolean(memorialProfile.nickname),
      hasBirthday: Boolean(memorialProfile.birthday),
      hasPassedDate: Boolean(memorialProfile.passedDate),
    },
    spirit: {
      id: spirit.id,
      name: spirit.name,
      spiritType: spirit.spiritType,
      personality: spirit.personality,
      memorialProfile,
      homeStyle: spirit.homeStyle,
      shareEnabled: spirit.shareEnabled,
      sharePath: spirit.shareEnabled ? `/share/${spirit.id}` : null,
      createdAt: spirit.createdAt,
      updatedAt: spirit.updatedAt,
      photoRefs: spirit.photoUrls,
      photoDownloadUrls: signedPhotoUrls,
    },
    statuses: safeStatuses,
    messages,
    blessings,
    notes: [
      'photoDownloadUrls are temporary signed links and may expire',
      'photoRefs are the canonical storage references saved by StillHere',
      'memorialProfile extracts commonly used fields from personality for easier review and restore',
      ...(options?.localFallback
        ? ['This export was generated from the local development store because the primary database was unavailable.']
        : []),
    ],
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const id = req.nextUrl.searchParams.get('id')
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing spirit id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (await shouldUseLocalDevStore()) {
      const spirit = await getLocalSpiritExport(user.id, id)

      if (!spirit) {
        return new Response(JSON.stringify({ error: 'Spirit not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const signedPhotoUrls = await createSignedPhotoUrls(spirit.photoUrls, 60 * 60 * 6)
      const exportPayload = buildExportPayload(spirit, signedPhotoUrls, {
        localFallback: true,
      })

      return new Response(JSON.stringify(exportPayload, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="${toSafeFileName(spirit.name)}-memorial-export.json"`,
        },
      })
    }

    const spirit = await prisma.spirit.findUnique({
      where: { id, userId: user.id },
      include: {
        statuses: {
          orderBy: { createdAt: 'desc' },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
        blessings: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            blessingType: true,
            amount: true,
            txHash: true,
            createdAt: true,
          },
        },
      },
    })

    if (!spirit) {
      return new Response(JSON.stringify({ error: 'Spirit not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const signedPhotoUrls = await createSignedPhotoUrls(spirit.photoUrls, 60 * 60 * 6)
    const exportPayload = buildExportPayload(spirit, signedPhotoUrls)

    return new Response(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${toSafeFileName(spirit.name)}-memorial-export.json"`,
      },
    })
  } catch (error) {
    console.error('Export spirit error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
