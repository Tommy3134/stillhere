import { PrivyClient } from '@privy-io/server-auth'
import { prisma } from './prisma'
import { shouldUseLocalDevStore } from './database-health'
import { getOrCreateLocalDevUser } from './local-dev-store'

const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
)

export async function getAuthUser(authHeader: string | null) {
  if (!authHeader?.startsWith('Bearer ')) return null

  try {
    const token = authHeader.slice(7)
    const verifiedClaims = await privyClient.verifyAuthToken(token)
    const privyId = verifiedClaims.userId
    const useLocalStore = await shouldUseLocalDevStore()

    if (useLocalStore) {
      const privyUser = await privyClient.getUser(privyId).catch(() => null)
      return getOrCreateLocalDevUser({
        privyId,
        email: privyUser?.email?.address || null,
        walletAddress: privyUser?.wallet?.address || null,
      })
    }

    // 查找或创建用户
    let user = await prisma.user.findUnique({ where: { privyId } })
    if (!user) {
      const privyUser = await privyClient.getUser(privyId)
      user = await prisma.user.create({
        data: {
          privyId,
          email: privyUser.email?.address || null,
          walletAddress: privyUser.wallet?.address || null,
        },
      })
    }
    return user
  } catch {
    return null
  }
}
