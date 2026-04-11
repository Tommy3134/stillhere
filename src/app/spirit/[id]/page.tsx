'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { usePrivy } from '@privy-io/react-auth'
import PixelPetEngine from '@/components/PixelPetEngine'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import { LoginButton } from '@/components/LoginButton'
import { AuthLoadingState } from '@/components/AuthLoadingState'
import { readResponsePayload } from '@/lib/read-response-payload'

const MOOD_CONFIG: Record<string, { emoji: string; bg: string; label: string }> = {
  sleepy: { emoji: '💤', bg: 'bg-blue-100', label: '犯困' },
  playful: { emoji: '🎮', bg: 'bg-yellow-100', label: '玩耍' },
  content: { emoji: '😊', bg: 'bg-green-100', label: '满足' },
  curious: { emoji: '🔍', bg: 'bg-purple-100', label: '好奇' },
  happy: { emoji: '✨', bg: 'bg-amber-100', label: '开心' },
}

interface SpiritStatus {
  id: string
  content: string
  mood: string
  createdAt: string
}

interface Spirit {
  id: string
  name: string
  spiritType: string
  createdAt: string
  updatedAt: string
  personality: {
    nickname?: string
    tags: string[]
    habits?: string
    funnyStory?: string
    birthday?: string
    passedDate?: string
    decor?: string[]
  }
  homeStyle: string
  shareEnabled: boolean
  photoUrls: string[]
  statuses: SpiritStatus[]
}

function formatMemorialDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export default function SpiritPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { ready, authenticated } = usePrivy()
  const authFetch = useAuthFetch()
  const [spirit, setSpirit] = useState<Spirit | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [updatingShare, setUpdatingShare] = useState(false)
  const [shareNotice, setShareNotice] = useState('')
  const [shareError, setShareError] = useState('')

  useEffect(() => {
    setPageError('')
    setLoading(true)

    if (!ready) return

    if (!authenticated) {
      setLoading(false)
      return
    }

    authFetch(`/api/spirit?id=${params.id}`)
      .then(async (res) => {
        const data = await readResponsePayload(res)

        if (!res.ok || !(data as { spirit?: Spirit }).spirit) {
          throw new Error((data as { error?: string }).error || '找不到这个纪念空间')
        }

        setSpirit((data as { spirit: Spirit }).spirit)
      })
      .catch((error) => {
        console.error(error)
        setSpirit(null)
        setPageError(error instanceof Error ? error.message : '纪念空间暂时不可用')
      })
      .finally(() => setLoading(false))
  }, [ready, authenticated, authFetch, params.id])

  if (!ready) {
    return (
      <AuthLoadingState
        title="正在准备纪念空间"
        body="详情页需要先确认登录状态和访问权限。要是这里停留太久，通常是登录服务还没完全就绪。"
      />
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-stone-400">加载中...</p>
      </main>
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-amber-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-light text-stone-700">登录后查看纪念空间</h1>
          <p className="mt-4 text-sm leading-7 text-stone-500">
            这里默认只对创建者开放。登录后，你可以继续补充回忆、查看照片和决定是否分享给亲友。
          </p>
          <div className="mt-8">
            <LoginButton
              label="登录并查看"
              className="inline-flex rounded-full bg-amber-600 px-8 py-3 text-white transition-colors hover:bg-amber-700"
            />
          </div>
        </div>
      </main>
    )
  }

  if (!spirit) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-stone-400">{pageError || '找不到这个纪念空间，或你暂时没有查看权限。'}</p>
      </main>
    )
  }

  const latestStatus = spirit.statuses[0]
  const mood = latestStatus?.mood || 'content'
  const statusText = latestStatus?.content || '这里安静地保存着和它有关的回忆'
  const moodInfo = MOOD_CONFIG[mood] || MOOD_CONFIG.content
  const memorialFacts = [
    spirit.personality.nickname ? { label: '家人常叫它', value: spirit.personality.nickname } : null,
    spirit.personality.birthday ? { label: '生日', value: formatMemorialDate(spirit.personality.birthday) } : null,
    spirit.personality.passedDate ? { label: '离开的日子', value: formatMemorialDate(spirit.personality.passedDate) } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item))
  const tags = spirit.personality.tags || []
  const personalityNotes = [
    spirit.personality.habits ? { label: '习惯和怪癖', value: spirit.personality.habits } : null,
    spirit.personality.funnyStory ? { label: '最让人笑的一件事', value: spirit.personality.funnyStory } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item))

  const toggleShare = async (shareEnabled: boolean) => {
    if (updatingShare) return

    setUpdatingShare(true)
    setShareError('')
    setShareNotice('')

    try {
      const res = await authFetch('/api/spirit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: spirit.id, shareEnabled }),
      })
      const data = await readResponsePayload(res)

      if (!res.ok) {
        throw new Error((data as { error?: string }).error || '更新分享设置失败')
      }

      setSpirit((current) => current ? {
        ...current,
        shareEnabled: (data as { spirit: { shareEnabled: boolean } }).spirit.shareEnabled,
      } : current)
      setShareNotice(
        shareEnabled
          ? '纪念页已经开启，你可以把链接发给亲友。'
          : '纪念页已经关闭，外部访问会被拦住。'
      )
    } catch (error) {
      setShareError(error instanceof Error ? error.message : '更新分享设置失败')
    } finally {
      setUpdatingShare(false)
    }
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/share/${spirit.id}`)
      setShareNotice('纪念页链接已复制。')
      setShareError('')
    } catch {
      setShareError('复制链接失败，请稍后再试')
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* 像素宠物场景 */}
        <PixelPetEngine
          spiritType={spirit.spiritType}
          mood={mood as 'sleepy' | 'playful' | 'content' | 'curious' | 'happy'}
          homeStyle={spirit.homeStyle as 'cozy_room' | 'garden' | 'cloud_loft' | 'mountain_cabin'}
          name={spirit.name}
          statusText={statusText}
          decor={spirit.personality?.decor}
        />

        <div className="flex items-center justify-center gap-2 mt-4 mb-6">
          <span className="text-sm text-stone-500">{moodInfo.label}</span>
          <span>{moodInfo.emoji}</span>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm leading-7 text-stone-500">
            这是你为 <span className="font-medium text-stone-700">{spirit.name}</span> 保存回忆的默认私密空间。
            现在我们先把纪念、照片和回访这条主链路做好；聊天、祈福和更复杂的互动能力会在后续阶段审慎解锁。
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-full bg-amber-600 px-5 py-3 text-sm text-white transition-colors hover:bg-amber-700"
            >
              返回我的空间
            </button>
            {spirit.shareEnabled ? (
              <>
                <Link
                  href={`/share/${spirit.id}`}
                  className="rounded-full border border-stone-300 px-5 py-3 text-center text-sm text-stone-600 transition-colors hover:bg-stone-100"
                >
                  打开纪念页
                </Link>
                <button
                  onClick={copyShareLink}
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-100"
                >
                  复制分享链接
                </button>
                <button
                  onClick={() => toggleShare(false)}
                  disabled={updatingShare}
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-500 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingShare ? '更新中...' : '关闭亲友分享'}
                </button>
              </>
            ) : (
              <button
                onClick={() => toggleShare(true)}
                disabled={updatingShare}
                className="rounded-full border border-dashed border-amber-400 px-5 py-3 text-sm text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingShare ? '开启中...' : '开启给亲友的纪念页'}
              </button>
            )}
          </div>
          <p className="mt-3 text-xs leading-6 text-stone-400">
            {spirit.shareEnabled
              ? '当前纪念页可通过专属链接访问，搜索引擎不会收录。你仍然可以随时关闭它。'
              : '分享默认关闭。只有你主动开启后，亲友才能通过纪念页链接进入。'}
          </p>
          {shareNotice && <p className="mt-3 text-xs leading-6 text-emerald-600">{shareNotice}</p>}
          {shareError && <p className="mt-3 text-xs leading-6 text-red-500">{shareError}</p>}
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm text-stone-400">纪念信息</h2>
          {memorialFacts.length > 0 ? (
            <div className="mt-3 space-y-3">
              {memorialFacts.map((fact) => (
                <div key={fact.label} className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-sm text-stone-400">{fact.label}</span>
                  <span className="text-sm text-right text-stone-700">{fact.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-stone-500">
              这里还没写下重要日子或家人怎么叫它。补一补，会让这个空间更像你真正记得的它。
            </p>
          )}
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm text-stone-400">它最像它的样子</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-amber-50 px-3 py-1.5 text-sm text-amber-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {personalityNotes.length > 0 ? (
            <div className="mt-4 space-y-4">
              {personalityNotes.map((item) => (
                <div key={item.label} className="rounded-2xl bg-stone-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600 whitespace-pre-wrap">{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-stone-500">
              你已经选了最基础的性格标签。下次可以再写下它的习惯、怪癖和最让人笑的一件事，让这个空间更像它。
            </p>
          )}
        </div>

        {/* 照片相册 */}
        {spirit.photoUrls?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm text-stone-400 mb-3">回忆相册</h2>
            <div className="grid grid-cols-3 gap-2">
              {spirit.photoUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setViewPhoto(url)}
                  className="relative aspect-square rounded-xl overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`${spirit.name} 的回忆照片 ${i + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 33vw, 180px"
                    className="object-cover transition-transform hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 照片查看器 */}
        {viewPhoto && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setViewPhoto(null)}>
            <div className="relative h-full w-full">
              <Image
                src={viewPhoto}
                alt={`${spirit.name} 的放大照片`}
                fill
                unoptimized
                sizes="100vw"
                className="rounded-2xl object-contain"
              />
            </div>
          </div>
        )}

        {/* 最近动态 */}
        <div>
          <h2 className="text-sm text-stone-400 mb-3">最近记录</h2>
          <div className="space-y-3">
            {spirit.statuses.map((status) => (
              <div key={status.id} className="flex items-start gap-3">
                <span className="text-xs text-stone-400 w-12 pt-0.5">
                  {new Date(status.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex-1 bg-white rounded-xl px-4 py-2.5 shadow-sm">
                  <p className="text-sm text-stone-600">{status.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
