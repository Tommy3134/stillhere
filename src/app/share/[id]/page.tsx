import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

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

async function getSpirit(id: string) {
  const spirit = await prisma.spirit.findUnique({
    where: { id },
    include: {
      statuses: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })
  return spirit
}

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const spirit = await getSpirit(id)
  if (!spirit) return {}

  const latestStatus = spirit.statuses[0]?.content ?? `${spirit.name}正在彼岸世界安好地生活`
  const ogImage = spirit.photoUrls.length > 0 ? spirit.photoUrls[0] : undefined

  return {
    title: `${spirit.name} 在彼岸世界 | StillHere`,
    description: latestStatus,
    openGraph: {
      title: `${spirit.name} 在彼岸世界 | StillHere`,
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
  const hasPhoto = spirit.photoUrls.length > 0

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center px-6 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* 头像 */}
        <div className="flex flex-col items-center space-y-4">
          {hasPhoto ? (
            <img
              src={spirit.photoUrls[0]}
              alt={spirit.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-amber-200 shadow-md"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-amber-100 flex items-center justify-center border-4 border-amber-200 shadow-md">
              <span className="text-5xl">{emoji}</span>
            </div>
          )}

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-light text-stone-700">{spirit.name}</h1>
            <p className="text-sm text-stone-400">
              {spirit.spiritType.startsWith('pet_') ? '在彼岸世界安好地生活着' : '在彼岸世界静好地存在着'}
            </p>
          </div>
        </div>

        {/* 当前状态 */}
        {latestStatus && (
          <div className="bg-white/60 rounded-2xl p-5 text-center shadow-sm">
            <p className="text-sm text-stone-400 mb-2">此刻</p>
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
              {spirit.statuses.map((status) => (
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
          </div>
        )}

        {/* CTA */}
        <div className="pt-4 text-center">
          <Link
            href="/"
            className="inline-block py-3 px-8 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
          >
            为你的TA创建一个新家
          </Link>
          <p className="text-xs text-stone-400 mt-3">
            仍在 / StillHere — 它们没有离开，只是去了另一个地方
          </p>
        </div>
      </div>
    </main>
  )
}
