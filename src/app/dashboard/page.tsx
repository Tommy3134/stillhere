'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { usePrivy } from '@privy-io/react-auth'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import { LoginButton } from '@/components/LoginButton'
import { AuthLoadingState } from '@/components/AuthLoadingState'
import { FeedbackPromptCard } from '@/components/FeedbackPromptCard'
import { getMemorialInsight } from '@/lib/memorial-insights'
import { getMemorialRoadmap } from '@/lib/memorial-roadmap'
import { readResponsePayload } from '@/lib/read-response-payload'

interface Spirit {
  id: string
  name: string
  spiritType: string
  shareEnabled?: boolean
  photoUrls: string[]
  personality: {
    nickname?: string
    tags?: string[]
    habits?: string
    funnyStory?: string
    birthday?: string
    passedDate?: string
  }
  statuses: Array<{ content: string; mood: string; createdAt?: string }>
}

const TYPE_EMOJI: Record<string, string> = {
  pet_cat: '🐱',
  pet_dog: '🐶',
  pet_other: '🐾',
  human: '👤',
}

export default function DashboardPage() {
  const router = useRouter()
  const { ready, authenticated } = usePrivy()
  const authFetch = useAuthFetch()
  const [spirits, setSpirits] = useState<Spirit[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [deletedNotice, setDeletedNotice] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    if (params.get('deleted') !== '1') {
      setDeletedNotice('')
      return
    }

    const deletedName = params.get('name')?.trim()
    setDeletedNotice(
      deletedName
        ? `已删除“${deletedName}”。分享入口和相关记录也已经一起关闭。`
        : '纪念空间已删除，分享入口和相关记录也已经一起关闭。'
    )
  }, [])

  useEffect(() => {
    setPageError('')

    if (!ready) return

    if (!authenticated) {
      setLoading(false)
      return
    }

    authFetch('/api/spirit')
      .then(async (res) => {
        const data = await readResponsePayload(res)
        if (!res.ok) {
          throw new Error((data as { error?: string }).error || '纪念空间列表暂时不可用')
        }

        setSpirits((data as { spirits?: Spirit[] }).spirits || [])
      })
      .catch((error) => {
        console.error(error)
        setSpirits([])
        setPageError(error instanceof Error ? error.message : '纪念空间列表暂时不可用')
      })
      .finally(() => setLoading(false))
  }, [ready, authenticated, authFetch])

  if (!ready) {
    return (
      <AuthLoadingState
        title="正在准备你的纪念空间"
        body="如果这里一直不动，优先检查 Privy 是否允许 localhost，并确认浏览器没有拦截登录弹层。"
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
          <h1 className="text-3xl font-light text-stone-700">登录后查看你的纪念空间</h1>
          <p className="mt-4 text-sm leading-7 text-stone-500">
            你的纪念空间默认私密保存，所以需要先登录才能查看和继续补充回忆。
          </p>
          <div className="mt-8">
            <LoginButton
              label="登录并进入"
              className="inline-flex rounded-full bg-amber-600 px-8 py-3 text-white transition-colors hover:bg-amber-700"
            />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-light text-stone-700 mb-6">我的纪念空间</h1>
        {deletedNotice && (
          <div className="mb-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-700 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <p>{deletedNotice}</p>
              <button
                type="button"
                onClick={() => {
                  setDeletedNotice('')
                  router.replace('/dashboard')
                }}
                className="shrink-0 text-xs text-emerald-700 underline underline-offset-4"
              >
                关闭
              </button>
            </div>
          </div>
        )}
        {pageError && (
          <div className="mb-6 rounded-2xl bg-white px-5 py-4 text-sm leading-6 text-red-500 shadow-sm">
            {pageError}
          </div>
        )}

        {spirits.length === 0 ? (
          <div className="space-y-6 py-12 text-center">
            <div>
              <p className="mb-2 text-stone-400">还没有创建纪念空间</p>
              <p className="mb-4 text-sm leading-6 text-stone-400">
                {deletedNotice
                  ? '如果你还想继续留下回忆，可以重新创建一个新的纪念空间。'
                  : '这里会保存你为它们建立的私密纪念空间。'}
              </p>
              <Link
                href="/create"
                className="inline-block rounded-full bg-amber-600 px-8 py-3 text-white transition-colors hover:bg-amber-700"
              >
                开始创建
              </Link>
            </div>
            <FeedbackPromptCard
              href="/feedback?source=dashboard"
              title="还没开始也很值得反馈"
              body="如果你在这里停住了，或者还不确定要不要创建，这种犹豫本身就是很重要的产品信号。"
              cta="告诉我们为什么"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {spirits.map(spirit => {
              const status = spirit.statuses?.[0]
              const emoji = TYPE_EMOJI[spirit.spiritType] || '🐾'
              const insight = getMemorialInsight(spirit)
              const roadmap = getMemorialRoadmap(spirit)
              const nextItem = roadmap.items.find((item) => item.state === 'next')
              return (
                <button
                  key={spirit.id}
                  onClick={() => router.push(`/spirit/${spirit.id}`)}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className="relative w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {spirit.photoUrls?.length > 0 ? (
                      <Image
                        src={spirit.photoUrls[0]}
                        alt={`${spirit.name} 的纪念照片`}
                        fill
                        unoptimized
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{emoji}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-700 font-medium">{spirit.name}</p>
                    <p className="text-sm text-stone-400 truncate">
                      {status?.content || '这里安静地保存着和它有关的回忆'}
                    </p>
                    <p className="mt-1 text-xs text-amber-700 truncate">
                      回来看看的理由：{insight.shortLabel}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-500">
                        纪念进展 {roadmap.doneCount}/{roadmap.totalCount}
                      </span>
                      <span className="truncate text-stone-400">
                        {nextItem ? `下一步：${nextItem.title}` : '已经可以安静地回来看看它'}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}

            <Link
              href="/create"
              className="block w-full py-3 border-2 border-dashed border-stone-300 text-stone-400 rounded-2xl text-center hover:border-amber-400 hover:text-amber-500 transition-colors"
            >
              + 创建新的纪念空间
            </Link>
            <FeedbackPromptCard
              href="/feedback?source=dashboard"
              title="回来看时，哪里最顺，哪里最卡？"
              body="不管是列表、进入详情、还是你对这个产品本身的第一印象，都欢迎直接告诉我们。"
              cta="去反馈"
            />
          </div>
        )}
      </div>
    </main>
  )
}
