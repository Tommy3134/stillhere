import 'server-only'

import { prisma } from './prisma'

const CHECK_TTL_MS = 30_000
const CHECK_TIMEOUT_MS = 1_500

let cachedResult: { useLocalStore: boolean; checkedAt: number } | null = null

export async function shouldUseLocalDevStore() {
  if (process.env.NODE_ENV === 'production') {
    return false
  }

  if (process.env.STILLHERE_FORCE_LOCAL_DEV_STORE === '1') {
    return true
  }

  if (cachedResult && Date.now() - cachedResult.checkedAt < CHECK_TTL_MS) {
    return cachedResult.useLocalStore
  }

  try {
    await Promise.race([
      prisma.$queryRawUnsafe('SELECT 1'),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database probe timeout')), CHECK_TIMEOUT_MS)
      }),
    ])

    cachedResult = { useLocalStore: false, checkedAt: Date.now() }
    return false
  } catch (error) {
    console.warn(
      'Primary database unavailable in development, using local dev store instead.',
      error instanceof Error ? error.message : error
    )
    cachedResult = { useLocalStore: true, checkedAt: Date.now() }
    return true
  }
}
