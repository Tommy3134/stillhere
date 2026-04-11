'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { DECOR_ITEMS } from '@/lib/constants'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import { LoginButton } from '@/components/LoginButton'
import { AuthLoadingState } from '@/components/AuthLoadingState'
import { FeedbackPromptCard } from '@/components/FeedbackPromptCard'
import { readResponsePayload } from '@/lib/read-response-payload'

type DecorKey = keyof typeof DECOR_ITEMS

export default function DecorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { ready, authenticated } = usePrivy()
  const authFetch = useAuthFetch()
  const [spirit, setSpirit] = useState<{ id: string; name: string; personality: { decor?: string[] } } | null>(null)
  const [owned, setOwned] = useState<DecorKey[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageError, setPageError] = useState('')

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
        if (!res.ok || !(data as { spirit?: { id?: string } }).spirit) {
          throw new Error((data as { error?: string }).error || '找不到这个纪念空间')
        }

        const spiritPayload = (data as {
          spirit: { id: string; name: string; personality: { decor?: string[] } }
        }).spirit
        setSpirit(spiritPayload)
        const decor = spiritPayload.personality?.decor || ['cat_bed', 'food_bowl', 'toy_ball']
        setOwned(decor as DecorKey[])
      })
      .catch((error) => {
        console.error(error)
        setSpirit(null)
        setPageError(error instanceof Error ? error.message : '装饰空间暂时不可用')
      })
      .finally(() => setLoading(false))
  }, [ready, authenticated, authFetch, params.id])

  const addDecor = async (key: DecorKey) => {
    if (owned.includes(key) || saving) return
    const item = DECOR_ITEMS[key]
    if (item.price > 0) {
      // TODO: 接入支付
      if (!confirm(`确定花 ¥${item.price} 购买${item.name}吗？`)) return
    }
    const newOwned = [...owned, key]
    setSaving(true)
    setPageError('')

    try {
      const res = await authFetch('/api/spirit/decor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spiritId: params.id, decor: newOwned }),
      })
      const data = await readResponsePayload(res)

      if (!res.ok) {
        throw new Error((data as { error?: string }).error || '保存装饰失败')
      }

      setOwned((((data as { decor?: string[] }).decor) || newOwned) as DecorKey[])
    } catch (error) {
      console.error(error)
      setPageError(error instanceof Error ? error.message : '保存装饰失败')
    } finally {
      setSaving(false)
    }
  }

  if (!ready) {
    return (
      <AuthLoadingState
        title="正在准备装饰空间"
        body="我们正在确认登录状态和访问权限。要是这里停留太久，通常是登录服务还没完全就绪。"
      />
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-amber-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-light text-stone-700">登录后查看装饰内测</h1>
          <p className="mt-4 text-sm leading-7 text-stone-500">
            装饰当前仍是探索线，只对纪念空间创建者开放，用来测试轻量个性化是否值得进入下一阶段。
          </p>
          <div className="mt-8">
            <LoginButton
              label="登录并继续"
              className="inline-flex rounded-full bg-amber-600 px-8 py-3 text-white transition-colors hover:bg-amber-700"
            />
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-stone-400">加载中...</p>
      </main>
    )
  }

  const categories = [
    { key: 'furniture', label: '家具' },
    { key: 'toy', label: '玩具' },
    { key: 'decor', label: '装饰' },
    { key: 'special', label: '特别' },
  ]

  return (
    <main className="min-h-screen bg-amber-50 pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="text-stone-500 text-2xl">←</button>
          <h1 className="text-lg text-stone-700">装饰空间内测</h1>
          <div className="w-8" />
        </div>

        {!spirit ? (
          <div className="rounded-2xl bg-white px-5 py-6 text-center text-sm leading-7 text-stone-500 shadow-sm">
            {pageError || '找不到这个纪念空间，或你暂时没有查看权限。'}
          </div>
        ) : (
          <>
            <div className="mb-6 rounded-2xl bg-white px-4 py-4 text-sm leading-6 text-stone-500 shadow-sm">
              这里仍是探索中的个性化能力，不属于第一阶段对外主承诺。当前只保留给主人自己试验和记录。
            </div>

            {/* 已拥有的装饰 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <h2 className="text-sm text-stone-400 mb-3">{spirit.name} 当前摆放</h2>
              <div className="flex flex-wrap gap-2">
                {owned.map(key => {
                  const item = DECOR_ITEMS[key]
                  return (
                    <span key={key} className="px-3 py-1.5 bg-amber-50 rounded-full text-sm flex items-center gap-1">
                      <span>{item.icon}</span>
                      <span className="text-stone-600">{item.name}</span>
                    </span>
                  )
                })}
              </div>
            </div>

            {/* 商店 */}
            {categories.map(cat => {
              const items = Object.entries(DECOR_ITEMS).filter(([, v]) => v.category === cat.key)
              return (
                <div key={cat.key} className="mb-6">
                  <h2 className="text-sm text-stone-400 mb-3">{cat.label}</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {items.map(([key, item]) => {
                      const isOwned = owned.includes(key as DecorKey)
                      return (
                        <button
                          key={key}
                          onClick={() => !isOwned && addDecor(key as DecorKey)}
                          disabled={saving}
                          className={`flex flex-col items-center gap-1 py-4 rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
                            isOwned
                              ? 'border-amber-300 bg-amber-50'
                              : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50/50'
                          }`}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-xs text-stone-600">{item.name}</span>
                          {!isOwned && (
                            <span className={`text-xs ${item.price === 0 ? 'text-green-500' : 'text-amber-600'}`}>
                              {item.price === 0 ? '免费' : `¥${item.price}`}
                            </span>
                          )}
                          {isOwned && <span className="text-xs text-amber-500">已拥有</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {pageError && (
              <p className="mt-4 text-center text-sm text-red-500">{pageError}</p>
            )}
            <div className="mt-8">
              <FeedbackPromptCard
                href={`/feedback?source=memorial_decor&spiritId=${encodeURIComponent(spirit.id)}&spiritName=${encodeURIComponent(spirit.name)}`}
                title="装饰空间这条线该不该继续？"
                body="如果你觉得它可爱但不重要、值得保留、或者应该完全换方向，这种判断对我们非常关键。"
                cta="反馈装饰体验"
              />
            </div>
          </>
        )}
      </div>
    </main>
  )
}
