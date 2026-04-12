import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { createShareablePhotoUrl, createSignedPhotoUrls } from '@/lib/storage'
import { shouldUseLocalDevStore } from '@/lib/database-health'
import { getLocalSharedSpirit } from '@/lib/local-dev-store'
import { sanitizeStatusRecord } from '@/lib/status-guardrails'

const EMOJI_MAP: Record<string, string> = {
  pet_cat: '🐱',
  pet_dog: '🐶',
  pet_other: '🐾',
  human: '👤',
}

const MOOD_MAP: Record<string, string> = {
  content: '😌',
  playful: '🎾',
  sleepy: '😴',
  curious: '🔍',
}

interface SharePersonality {
  nickname?: string
  tags?: string[]
  habits?: string
  funnyStory?: string
  birthday?: string
  passedDate?: string
}

function getOwnerName(user?: { displayName?: string | null; email?: string | null } | null) {
  const displayName = user?.displayName?.trim()
  if (displayName) return displayName

  const emailPrefix = user?.email?.split('@')[0]?.trim()
  if (emailPrefix) return emailPrefix

  return '主人'
}

function formatMemorialDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

async function getSpirit(id: string) {
  if (await shouldUseLocalDevStore()) {
    const spirit = await getLocalSharedSpirit(id)

    if (!spirit) {
      return null
    }

    return {
      ...spirit,
      statuses: spirit.statuses.map((status) => ({
        ...sanitizeStatusRecord(status),
        createdAt: new Date(status.createdAt),
      })),
    }
  }

  const spirit = await prisma.spirit.findFirst({
    where: { id, shareEnabled: true },
    include: {
      user: {
        select: {
          displayName: true,
          email: true,
        },
      },
      statuses: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
  if (!spirit) {
    return null
  }

  return {
    ...spirit,
    statuses: spirit.statuses.map((status) => sanitizeStatusRecord(status)),
  }
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const spirit = await getSpirit(id)
  if (!spirit) return {}

  const latestStatus = spirit.statuses[0]?.content ?? `${spirit.name}的纪念页`
  const ogImage = await createShareablePhotoUrl(spirit.photoUrls[0]) || undefined

  return {
    title: `${spirit.name} 的纪念页 | StillHere`,
    description: latestStatus,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: `${spirit.name} 的纪念页 | StillHere`,
      description: latestStatus,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  }
}

export default async function SharePage({ params }: Props) {
  const { id } = await params
  const spirit = await getSpirit(id)
  if (!spirit) notFound()

  const emoji = EMOJI_MAP[spirit.spiritType] ?? '🐾'
  const latestStatus = spirit.statuses[0]
  const shareablePhotos = await createSignedPhotoUrls(spirit.photoUrls.slice(0, 4), 60 * 30)
  const heroPhoto = shareablePhotos[0] || await createShareablePhotoUrl(spirit.photoUrls[0])
  const hasPhoto = Boolean(heroPhoto)
  const personality = (
    spirit.personality && typeof spirit.personality === 'object' && !Array.isArray(spirit.personality)
      ? spirit.personality
      : {}
  ) as SharePersonality
  const memorialFacts = [
    personality.nickname ? { label: '家人常叫它', value: personality.nickname } : null,
    personality.birthday ? { label: '生日', value: formatMemorialDate(personality.birthday) } : null,
    personality.passedDate ? { label: '离开的日子', value: formatMemorialDate(personality.passedDate) } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item))
  const personalityNotes = [
    personality.habits ? { label: '习惯和怪癖', value: personality.habits } : null,
    personality.funnyStory ? { label: '总会让人想起的一件事', value: personality.funnyStory } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item))
  const tags = Array.isArray(personality.tags) ? personality.tags : []
  const ownerName = getOwnerName(spirit.user)

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center px-6 py-12">
      <div className="max-w-xl w-full space-y-8">
        <div className="rounded-2xl bg-white/80 px-5 py-5 shadow-sm">
          <p className="text-sm leading-7 text-stone-500">
            你正在看 <span className="font-medium text-stone-700">{spirit.name}</span> 的纪念空间 — 这是主人 {ownerName} 分享给你的。
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-500">
            你可以看照片和故事,<span className="font-medium text-stone-700">但不会留下访问记录</span>,也不能留言或修改。
          </p>
        </div>

        {/* 头像 */}
        <div className="flex flex-col items-center space-y-4">
          {hasPhoto ? (
            <Image
              src={heroPhoto!}
              alt={spirit.name}
              width={128}
              height={128}
              unoptimized
              className="w-32 h-32 rounded-full object-cover border-4 border-amber-200 shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200 shadow-md">
              <span className="text-5xl">{emoji}</span>
            </div>
          )}

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-light text-stone-700">{spirit.name}</h1>
            {personality.nickname && (
              <p className="text-sm text-stone-500">家里常常叫它 {personality.nickname}</p>
            )}
            <p className="text-sm text-stone-400">
              这里保存着和它有关的照片、故事与想念
            </p>
          </div>
        </div>

        {memorialFacts.length > 0 && (
          <div className="rounded-2xl bg-white/60 p-5 shadow-sm">
            <h2 className="text-sm text-stone-400">纪念信息</h2>
            <div className="mt-3 space-y-3">
              {memorialFacts.map((fact) => (
                <div key={fact.label} className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-sm text-stone-400">{fact.label}</span>
                  <span className="text-right text-sm text-stone-700">{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="rounded-2xl bg-white/60 p-5 shadow-sm">
            <h2 className="text-sm text-stone-400">它最像它的样子</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <span key={tag} className="rounded-full bg-amber-100 px-3 py-1.5 text-sm text-amber-700">
                  {tag}
                </span>
              ))}
            </div>

            {personalityNotes.length > 0 && (
              <div className="mt-4 space-y-3">
                {personalityNotes.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-stone-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
                    <p className="mt-2 text-sm leading-7 text-stone-600 whitespace-pre-wrap">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 当前状态 */}
        {latestStatus && (
          <div className="bg-white/60 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-sm text-stone-400 mb-2">纪念记录</p>
            <p className="text-lg text-stone-600 leading-relaxed">
              {MOOD_MAP[latestStatus.mood] ?? '😌'} {latestStatus.content}
            </p>
          </div>
        )}

        {/* 最近动态 */}
        {spirit.statuses.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm text-stone-400 text-center">最近动态</h2>
            <div className="space-y-2">
              {spirit.statuses.map((status: { id: string; content: string; mood: string; createdAt: Date }) => (
                <div
                  key={status.id}
                  className="bg-white/40 rounded-xl px-4 py-3 flex items-start gap-3"
                >
                  <span className="text-lg shrink-0">{MOOD_MAP[status.mood] ?? '😌'}</span>
                  <div className="min-w-0">
                    <p className="text-stone-600 text-sm leading-relaxed">{status.content}</p>
                    <p className="text-xs text-stone-300 mt-1">
                      {status.createdAt.toLocaleDateString('zh-CN', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs leading-6 text-stone-400">
              StillHere 不做&quot;数字复活&quot;。我们记住你讲的故事,帮你把它放在一个地方。AI 的角色是整理和回放,不是复活。
            </p>
          </div>
        )}

        {shareablePhotos.length > 1 && (
          <div className="space-y-3">
            <h2 className="text-sm text-stone-400 text-center">回忆相册</h2>
            <div className="grid grid-cols-2 gap-3">
              {shareablePhotos.slice(1).map((photoUrl, index) => (
                <div key={photoUrl} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/40 shadow-sm">
                  <Image
                    src={photoUrl}
                    alt={`${spirit.name} 的回忆照片 ${index + 2}`}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 50vw, 280px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="pt-4 space-y-3 text-center">
          <Link
            href="/"
            className="block py-3 px-8 border border-stone-300 text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
          >
            为你的 TA 创建纪念空间
          </Link>
          <p className="text-xs text-stone-400 mt-3">
            仍在 / StillHere - 留下一个可以回来看它的地方
          </p>
        </div>

        <div className="rounded-2xl bg-white/70 px-5 py-5 text-center shadow-sm">
          <p className="text-sm leading-7 text-stone-500">这是一个纪念空间,不是社交媒体。</p>
          <p className="mt-2 text-sm leading-7 text-stone-500">
            如果你想表达什么,请直接告诉主人,而不是留下评论 — 这个地方是为主人和 TA 的记忆留的,不是为了讨论。
          </p>
        </div>
      </div>
    </main>
  )
}
