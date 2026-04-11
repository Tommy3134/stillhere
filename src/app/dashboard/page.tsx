'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePrivy } from '@privy-io/react-auth'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import { LoginButton } from '@/components/LoginButton'
import { AuthLoadingState } from '@/components/AuthLoadingState'
import { readResponsePayload } from '@/lib/read-response-payload'

interface Spirit {
  id: string
  name: string
  spiritType: string
  shareEnabled?: boolean
  photoUrls: string[]
  statuses: Array<{ content: string; mood: string; createdAt?: string }>
}

const TYPE_EMOJI: Record<string, string> = {
  pet_cat: '🐱',
  pet_dog: '🐶',
  pet_other: '🐾',
  human: '👤',
}

export default function DashboardPage() {
  const { ready, authenticated } = usePrivy()
  const authFetch = useAuthFetch()
  const [spirits, setSpirits] = useState<Spirit[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

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
        {pageError && (
          <div className="mb-6 rounded-2xl bg-white px-5 py-4 text-sm leading-6 text-red-500 shadow-sm">
            {pageError}
          </div>
        )}

        {spirits.length === 0 ? (
          <div className="rounded-[2rem] bg-white px-6 py-10 text-center shadow-sm">
            <p className="mb-2 text-stone-400">还没有创建纪念空间</p>
            <p className="mb-6 text-sm leading-6 text-stone-400">
              这里会保存你为它们建立的私密纪念空间。开始之后，你可以随时回来补充照片、故事和想说的话。
            </p>
            <Link
              href="/create"
              className="inline-block rounded-full bg-amber-600 px-8 py-3 text-white transition-colors hover:bg-amber-700"
            >
              开始创建
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {spirits.map(spirit => {
              const status = spirit.statuses?.[0]
              const emoji = TYPE_EMOJI[spirit.spiritType] || '🐾'
              return (
                <Link
                  key={spirit.id}
                  href={`/spirit/${spirit.id}`}
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
                    <p className="mt-2 text-xs text-stone-500">
                      {spirit.shareEnabled ? '已开启亲友分享' : '默认私密，仅你可见'}
                    </p>
                  </div>
                </Link>
              )
            })}

            <Link
              href="/create"
              className="block w-full py-3 border-2 border-dashed border-stone-300 text-stone-400 rounded-2xl text-center hover:border-amber-400 hover:text-amber-500 transition-colors"
            >
              + 创建新的纪念空间
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
