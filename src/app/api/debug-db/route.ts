import { NextResponse } from 'next/server'
import pg from 'pg'

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    region: process.env.VERCEL_REGION || 'unknown',
    dbUrlSet: Boolean(process.env.DATABASE_URL),
    dbUrlPreview: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@')
      : 'NOT SET',
  }

  // Test 1: raw pg connection (bypass Prisma entirely)
  try {
    const start = Date.now()
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 8000,
    })
    const client = await pool.connect()
    const res = await client.query('SELECT count(*) FROM users')
    client.release()
    await pool.end()
    results.rawPg = {
      status: 'connected',
      userCount: res.rows[0].count,
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    results.rawPg = {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      code: (error as { code?: string }).code,
    }
  }

  // Test 2: Prisma adapter connection
  try {
    const { PrismaClient } = await import('@prisma/client')
    const { PrismaPg } = await import('@prisma/adapter-pg')
    const start = Date.now()
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 8000,
    })
    const prisma = new PrismaClient({ adapter })
    const count = await prisma.user.count()
    await prisma.$disconnect()
    results.prismaAdapter = {
      status: 'connected',
      userCount: count,
      latencyMs: Date.now() - start,
    }
  } catch (error) {
    results.prismaAdapter = {
      status: 'failed',
      error: error instanceof Error ? error.message.slice(0, 300) : String(error),
      code: (error as { code?: string }).code,
    }
  }

  const anySuccess = (results.rawPg as { status: string })?.status === 'connected' ||
    (results.prismaAdapter as { status: string })?.status === 'connected'

  return NextResponse.json(results, { status: anySuccess ? 200 : 500 })
}
