import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { shouldUseLocalDevStore } from '@/lib/database-health'
import { updateLocalUserConsent } from '@/lib/local-dev-store'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (await shouldUseLocalDevStore()) {
      await updateLocalUserConsent(user.id)
      return NextResponse.json({ ok: true })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { consentAcceptedAt: new Date() },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Consent error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req.headers.get('authorization'))
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (await shouldUseLocalDevStore()) {
      return NextResponse.json({ consentAccepted: true })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { consentAcceptedAt: true },
    })

    return NextResponse.json({
      consentAccepted: Boolean(dbUser?.consentAcceptedAt),
    })
  } catch (error) {
    console.error('Consent check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
