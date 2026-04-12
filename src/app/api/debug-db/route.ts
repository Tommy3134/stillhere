import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL_set: Boolean(process.env.DATABASE_URL),
      DATABASE_URL_preview: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@').slice(0, 80) + '...'
        : 'NOT SET',
      DIRECT_URL_set: Boolean(process.env.DIRECT_URL),
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION || 'unknown',
    },
  }

  try {
    const start = Date.now()
    const count = await prisma.user.count()
    results.db = {
      status: 'connected',
      userCount: count,
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    results.db = {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string }).code,
    }
  }

  return NextResponse.json(results, { status: results.db && (results.db as { status: string }).status === 'connected' ? 200 : 500 })
}
