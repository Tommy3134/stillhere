import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { shouldUseLocalDevStore } from '@/lib/database-health'
import { appendLocalFeedbackSubmission, listLocalFeedbackSubmissions } from '@/lib/local-feedback-store'
import { canReviewFeedback } from '@/lib/feedback-review-access'
import { feedbackSubmissionSchema } from '@/lib/validations'

function buildFeedbackSummary<T extends { source: string; sourceLabel?: string | null }>(items: T[]) {
  const bySource = items.reduce<Record<string, { count: number; sourceLabel: string }>>((acc, item) => {
    const key = item.source || 'unknown'
    const current = acc[key]

    acc[key] = {
      count: (current?.count || 0) + 1,
      sourceLabel: item.sourceLabel || current?.sourceLabel || key,
    }

    return acc
  }, {})

  return {
    total: items.length,
    bySource: Object.entries(bySource)
      .map(([source, value]) => ({
        source,
        sourceLabel: value.sourceLabel,
        count: value.count,
      }))
      .sort((left, right) => right.count - left.count),
  }
}

function normalizeContextSnapshot(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const snapshot = value as Record<string, unknown>
  return {
    progressLabel: typeof snapshot.progressLabel === 'string' ? snapshot.progressLabel : '',
    nextStep: typeof snapshot.nextStep === 'string' ? snapshot.nextStep : '',
    photoCount: typeof snapshot.photoCount === 'number' ? snapshot.photoCount : null,
    shareEnabled: typeof snapshot.shareEnabled === 'boolean' ? snapshot.shareEnabled : null,
    returnReason: typeof snapshot.returnReason === 'string' ? snapshot.returnReason : '',
  }
}

function buildFeedbackCreateData(input: {
  source: string
  sourceLabel: string
  spiritId: string | null
  spiritName: string | null
  contextSnapshot?: unknown
  who: string | null
  feeling: string | null
  comeback: string | null
  feature: string | null
  wanted: string | null
  price: string | null
  share: string | null
  other: string | null
  createdAt: Date
  userId?: string | null
  includeSnapshot?: boolean
}) {
  return {
    source: input.source,
    sourceLabel: input.sourceLabel,
    spiritId: input.spiritId,
    spiritName: input.spiritName,
    ...(input.includeSnapshot
      ? { contextSnapshot: input.contextSnapshot ? JSON.parse(JSON.stringify(input.contextSnapshot)) : null }
      : {}),
    who: input.who,
    feeling: input.feeling,
    comeback: input.comeback,
    feature: input.feature,
    wanted: input.wanted,
    price: input.price,
    share: input.share,
    other: input.other,
    createdAt: input.createdAt,
    ...(input.userId ? { user: { connect: { id: input.userId } } } : {}),
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!canReviewFeedback(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const source = req.nextUrl.searchParams.get('source')?.trim() || ''
    const limitParam = Number.parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 50

    if (await shouldUseLocalDevStore()) {
      const submissions = await listLocalFeedbackSubmissions({
        source: source || undefined,
        limit,
      })

      const normalized = submissions.map((item) => ({
        id: `${item.createdAt}-${item.userId || 'anonymous'}`,
        userId: item.userId,
        source: item.context?.source || 'unknown',
        sourceLabel: item.context?.sourceLabel || 'unknown',
        spiritId: item.context?.spiritId || null,
        spiritName: item.context?.spiritName || null,
        contextSnapshot: normalizeContextSnapshot(item.context?.snapshot),
        who: item.who || null,
        feeling: item.feeling || null,
        comeback: item.comeback || null,
        feature: item.feature || null,
        wanted: item.wanted || null,
        price: item.price || null,
        share: item.share || null,
        other: item.other || null,
        createdAt: item.createdAt,
      }))

      return NextResponse.json({
        submissions: normalized,
        summary: buildFeedbackSummary(normalized),
        storage: 'local-dev-file',
      })
    }

    let submissions: Array<{
      id: string
      userId: string | null
      source: string
      sourceLabel: string
      spiritId: string | null
      spiritName: string | null
      contextSnapshot?: unknown
      who: string | null
      feeling: string | null
      comeback: string | null
      feature: string | null
      wanted: string | null
      price: string | null
      share: string | null
      other: string | null
      createdAt: Date
    }>

    try {
      submissions = await prisma.feedbackSubmission.findMany({
        where: {
          ...(source ? { source } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          userId: true,
          source: true,
          sourceLabel: true,
          spiritId: true,
          spiritName: true,
          contextSnapshot: true,
          who: true,
          feeling: true,
          comeback: true,
          feature: true,
          wanted: true,
          price: true,
          share: true,
          other: true,
          createdAt: true,
        },
      })
    } catch (error) {
      console.error('Feedback read with context snapshot failed, retrying without snapshot:', error)
      submissions = await prisma.feedbackSubmission.findMany({
        where: {
          ...(source ? { source } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          userId: true,
          source: true,
          sourceLabel: true,
          spiritId: true,
          spiritName: true,
          who: true,
          feeling: true,
          comeback: true,
          feature: true,
          wanted: true,
          price: true,
          share: true,
          other: true,
          createdAt: true,
        },
      })
    }

    const normalized = submissions.map((item) => ({
      ...item,
      contextSnapshot: normalizeContextSnapshot(item.contextSnapshot),
    }))

    return NextResponse.json({
      submissions: normalized,
      summary: buildFeedbackSummary(normalized),
      storage: 'database',
    })
  } catch (error) {
    console.error('Feedback read failed:', error)
    return NextResponse.json({ error: 'Feedback read failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json()
    const parsed = feedbackSubmissionSchema.safeParse(raw)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid feedback payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const timestamp = new Date().toISOString()
    const context = data.context || {}
    const user = await getAuthUser(req.headers.get('authorization')).catch(() => null)

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
      `Source: ${context.sourceLabel || context.source || '-'}`,
      `SpiritId: ${context.spiritId || '-'}`,
      `SpiritName: ${context.spiritName || '-'}`,
      `Snapshot: ${JSON.stringify(context.snapshot || {})}`,
      `UserId: ${user?.id || '-'}`,
    ]
    console.log(lines.join('\n'))

    const payload = {
      ...data,
      userId: user?.id || null,
      createdAt: timestamp,
    }

    if (await shouldUseLocalDevStore()) {
      await appendLocalFeedbackSubmission(payload)
      return NextResponse.json({ success: true, storage: 'local-dev-file' })
    }

    const createInput = {
      source: context.source || 'unknown',
      sourceLabel: context.sourceLabel || 'unknown',
      spiritId: context.spiritId || null,
      spiritName: context.spiritName || null,
      contextSnapshot: context.snapshot,
      who: data.who || null,
      feeling: data.feeling || null,
      comeback: data.comeback || null,
      feature: data.feature || null,
      wanted: data.wanted || null,
      price: data.price || null,
      share: data.share || null,
      other: data.other || null,
      createdAt: new Date(timestamp),
      userId: user?.id || null,
    }

    try {
      await prisma.feedbackSubmission.create({
        data: buildFeedbackCreateData({
          ...createInput,
          includeSnapshot: true,
        }),
      })

      return NextResponse.json({ success: true, storage: 'database' })
    } catch (error) {
      console.error('Feedback persistence with context snapshot failed, retrying without snapshot:', error)

      try {
        await prisma.feedbackSubmission.create({
          data: buildFeedbackCreateData({
            ...createInput,
            includeSnapshot: false,
          }),
        })

        return NextResponse.json({ success: true, storage: 'database-no-snapshot' })
      } catch (retryError) {
        console.error('Feedback persistence failed after retry:', retryError)

        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ success: true, storage: 'runtime-log-fallback' })
        }

        await appendLocalFeedbackSubmission(payload)
        return NextResponse.json({ success: true, storage: 'local-fallback' })
      }
    }

  } catch (error) {
    console.error('Feedback submit failed:', error)
    return NextResponse.json({ error: 'Feedback submit failed' }, { status: 500 })
  }
}
