import 'server-only'

import { randomUUID } from 'crypto'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

type NullableString = string | null

export interface LocalDevUser {
  id: string
  privyId: string
  email: NullableString
  walletAddress: NullableString
  displayName: NullableString
  avatarUrl: NullableString
  consentAcceptedAt: NullableString
  createdAt: string
  updatedAt: string
}

export interface LocalSpiritStatusRecord {
  id: string
  spiritId: string
  content: string
  mood: string
  createdAt: string
}

export interface LocalMessageRecord {
  id: string
  spiritId: string
  userId: string
  role: string
  content: string
  createdAt: string
}

export interface LocalBlessingRecord {
  id: string
  spiritId: string
  userId: string
  blessingType: string
  amount: number
  txHash: NullableString
  createdAt: string
}

export interface LocalSpiritRecord {
  id: string
  userId: string
  tokenId: number | null
  name: string
  spiritType: string
  personality: Record<string, unknown>
  photoUrls: string[]
  metadataUri: NullableString
  homeStyle: string
  shareEnabled: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LocalSpiritWithRelations extends LocalSpiritRecord {
  user?: Pick<LocalDevUser, 'displayName' | 'email'> | null
  statuses: LocalSpiritStatusRecord[]
  messages?: LocalMessageRecord[]
  blessings?: LocalBlessingRecord[]
}

export interface LocalActiveSpiritSummary {
  id: string
  userId: string
  name: string
  spiritType: string
  personality: Record<string, unknown>
  homeStyle: string
}

interface LocalDevStore {
  users: LocalDevUser[]
  spirits: LocalSpiritRecord[]
  statuses: LocalSpiritStatusRecord[]
  messages: LocalMessageRecord[]
  blessings: LocalBlessingRecord[]
}

const localDataDir = path.join(process.cwd(), '.stillhere-local')
const storeFilePath = path.join(localDataDir, 'stillhere-dev-store.json')
const legacyStoreFilePath = path.join(process.cwd(), '.next', 'cache', 'stillhere-dev-store.json')

let writeChain = Promise.resolve()

function emptyStore(): LocalDevStore {
  return {
    users: [],
    spirits: [],
    statuses: [],
    messages: [],
    blessings: [],
  }
}

function sortByDateDesc<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  })
}

async function readStore() {
  try {
    const raw = await readFile(storeFilePath, 'utf8')
    return JSON.parse(raw) as LocalDevStore
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      try {
        const raw = await readFile(legacyStoreFilePath, 'utf8')
        return JSON.parse(raw) as LocalDevStore
      } catch (legacyError) {
        if ((legacyError as NodeJS.ErrnoException).code === 'ENOENT') {
          return emptyStore()
        }

        throw legacyError
      }
    }
    throw error
  }
}

async function persistStore(store: LocalDevStore) {
  await mkdir(path.dirname(storeFilePath), { recursive: true })
  await writeFile(storeFilePath, JSON.stringify(store, null, 2), 'utf8')
}

async function updateStore<T>(updater: (store: LocalDevStore) => T | Promise<T>) {
  let result!: T

  writeChain = writeChain.then(async () => {
    const store = await readStore()
    result = await updater(store)
    await persistStore(store)
  })

  await writeChain
  return result
}

function withSpiritRelations(
  store: LocalDevStore,
  spirit: LocalSpiritRecord,
  options?: { includeMessages?: boolean; includeBlessings?: boolean; statusLimit?: number }
): LocalSpiritWithRelations {
  const statusLimit = options?.statusLimit
  const statuses = sortByDateDesc(
    store.statuses.filter((status) => status.spiritId === spirit.id)
  )

  return {
    ...spirit,
    statuses: typeof statusLimit === 'number' ? statuses.slice(0, statusLimit) : statuses,
    ...(options?.includeMessages
      ? {
          messages: [...store.messages]
            .filter((message) => message.spiritId === spirit.id)
            .sort((left, right) => {
              return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
            }),
        }
      : {}),
    ...(options?.includeBlessings
      ? {
          blessings: sortByDateDesc(
            store.blessings.filter((blessing) => blessing.spiritId === spirit.id)
          ),
        }
      : {}),
  }
}

export async function getOrCreateLocalDevUser(input: {
  privyId: string
  email?: NullableString
  walletAddress?: NullableString
}) {
  return updateStore((store) => {
    const now = new Date().toISOString()
    const existing = store.users.find((user) => user.privyId === input.privyId)

    if (existing) {
      existing.email = input.email ?? existing.email
      existing.walletAddress = input.walletAddress ?? existing.walletAddress
      existing.updatedAt = now
      return existing
    }

    const user: LocalDevUser = {
      id: `local-${randomUUID()}`,
      privyId: input.privyId,
      email: input.email ?? null,
      walletAddress: input.walletAddress ?? null,
      displayName: null,
      avatarUrl: null,
      consentAcceptedAt: null,
      createdAt: now,
      updatedAt: now,
    }

    store.users.push(user)
    return user
  })
}

export async function updateLocalUserConsent(userId: string) {
  return updateStore((store) => {
    const user = store.users.find((u) => u.id === userId)
    if (user) {
      user.consentAcceptedAt = new Date().toISOString()
      user.updatedAt = new Date().toISOString()
    }
  })
}

export async function listLocalSpirits(userId: string) {
  const store = await readStore()

  return sortByDateDesc(
    store.spirits.filter((spirit) => spirit.userId === userId && spirit.isActive)
  ).map((spirit) => withSpiritRelations(store, spirit, { statusLimit: 1 }))
}

export async function listAllLocalActiveSpirits() {
  const store = await readStore()

  return sortByDateDesc(
    store.spirits.filter((spirit) => spirit.isActive)
  ).map((spirit) => ({
    id: spirit.id,
    userId: spirit.userId,
    name: spirit.name,
    spiritType: spirit.spiritType,
    personality: spirit.personality,
    homeStyle: spirit.homeStyle,
  })) satisfies LocalActiveSpiritSummary[]
}

export async function getLocalSpirit(userId: string, id: string) {
  const store = await readStore()
  const spirit = store.spirits.find((item) => item.id === id && item.userId === userId)

  if (!spirit) {
    return null
  }

  return withSpiritRelations(store, spirit, { statusLimit: 5 })
}

export async function getLocalSharedSpirit(id: string) {
  const store = await readStore()
  const spirit = store.spirits.find((item) => item.id === id && item.shareEnabled)

  if (!spirit) {
    return null
  }

  const owner = store.users.find((user) => user.id === spirit.userId)

  return {
    ...withSpiritRelations(store, spirit, { statusLimit: 5 }),
    user: owner
      ? {
          displayName: owner.displayName,
          email: owner.email,
        }
      : null,
  }
}

export async function createLocalSpirit(input: {
  userId: string
  name: string
  spiritType: string
  personality: Record<string, unknown>
  homeStyle: string
  photoUrls: string[]
}) {
  return updateStore((store) => {
    const now = new Date().toISOString()
    const spirit: LocalSpiritRecord = {
      id: `local-spirit-${randomUUID()}`,
      userId: input.userId,
      tokenId: null,
      name: input.name,
      spiritType: input.spiritType,
      personality: input.personality,
      photoUrls: input.photoUrls,
      metadataUri: null,
      homeStyle: input.homeStyle,
      shareEnabled: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    const status: LocalSpiritStatusRecord = {
      id: `local-status-${randomUUID()}`,
      spiritId: spirit.id,
      content: '纪念空间刚刚建立，你可以继续补充和它有关的回忆。',
      mood: 'content',
      createdAt: now,
    }

    store.spirits.push(spirit)
    store.statuses.push(status)

    return {
      ...spirit,
      statuses: [status],
    } satisfies LocalSpiritWithRelations
  })
}

export async function updateLocalSpiritSharing(userId: string, id: string, shareEnabled: boolean) {
  return updateStore((store) => {
    const spirit = store.spirits.find((item) => item.id === id && item.userId === userId)

    if (!spirit) {
      return null
    }

    spirit.shareEnabled = shareEnabled
    spirit.updatedAt = new Date().toISOString()
    return spirit
  })
}

export async function updateLocalSpiritDetails(input: {
  userId: string
  id: string
  name: string
  personality: Record<string, unknown>
  addPhotoUrls: string[]
  removePhotoRefs: string[]
}) {
  return updateStore((store) => {
    const spirit = store.spirits.find((item) => item.id === input.id && item.userId === input.userId)

    if (!spirit) {
      return { kind: 'not_found' } as const
    }

    const removedPhotoSet = new Set(input.removePhotoRefs)
    const keptPhotoUrls = spirit.photoUrls.filter((photoUrl) => !removedPhotoSet.has(photoUrl))
    const nextPhotoUrls = [...keptPhotoUrls, ...input.addPhotoUrls]
    if (nextPhotoUrls.length > 18) {
      return { kind: 'too_many_photos' } as const
    }

    spirit.name = input.name
    spirit.personality = input.personality
    spirit.photoUrls = nextPhotoUrls
    spirit.updatedAt = new Date().toISOString()

    return {
      kind: 'ok',
      spirit: withSpiritRelations(store, spirit, { statusLimit: 5 }),
    } as const
  })
}

export async function deleteLocalSpirit(userId: string, id: string) {
  return updateStore((store) => {
    const spiritIndex = store.spirits.findIndex((item) => item.id === id && item.userId === userId)

    if (spiritIndex === -1) {
      return null
    }

    const [spirit] = store.spirits.splice(spiritIndex, 1)
    store.statuses = store.statuses.filter((status) => status.spiritId !== id)
    store.messages = store.messages.filter((message) => message.spiritId !== id)
    store.blessings = store.blessings.filter((blessing) => blessing.spiritId !== id)
    // Local feedback entries live in local-feedback-store NDJSON and are cleaned in the API route.

    return spirit
  })
}

export async function getLocalSpiritStatuses(userId: string, spiritId: string) {
  const spirit = await getLocalSpirit(userId, spiritId)

  if (!spirit) {
    return null
  }

  return spirit.statuses
}

export async function getLocalSpiritExport(userId: string, id: string) {
  const store = await readStore()
  const spirit = store.spirits.find((item) => item.id === id && item.userId === userId)

  if (!spirit) {
    return null
  }

  return withSpiritRelations(store, spirit, {
    includeMessages: true,
    includeBlessings: true,
  })
}

export async function createLocalSpiritStatus(input: {
  spiritId: string
  content: string
  mood: string
}) {
  return updateStore((store) => {
    const spirit = store.spirits.find((item) => item.id === input.spiritId && item.isActive)

    if (!spirit) {
      return null
    }

    const status: LocalSpiritStatusRecord = {
      id: `local-status-${randomUUID()}`,
      spiritId: input.spiritId,
      content: input.content,
      mood: input.mood,
      createdAt: new Date().toISOString(),
    }

    store.statuses.push(status)
    spirit.updatedAt = status.createdAt

    return status
  })
}

export async function createLocalSpiritMessage(input: {
  spiritId: string
  userId: string
  role: string
  content: string
}) {
  return updateStore((store) => {
    const spirit = store.spirits.find((item) => item.id === input.spiritId && item.userId === input.userId)

    if (!spirit) {
      return null
    }

    const message: LocalMessageRecord = {
      id: `local-message-${randomUUID()}`,
      spiritId: input.spiritId,
      userId: input.userId,
      role: input.role,
      content: input.content,
      createdAt: new Date().toISOString(),
    }

    store.messages.push(message)
    spirit.updatedAt = message.createdAt

    return message
  })
}
