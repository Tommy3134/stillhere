'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { BLESSING_ITEMS } from '@/lib/constants'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import { LoginButton } from '@/components/LoginButton'
import { AuthLoadingState } from '@/components/AuthLoadingState'
import { FeedbackPromptCard } from '@/components/FeedbackPromptCard'
import { readResponsePayload } from '@/lib/read-response-payload'

interface Spirit {
  id: string
  name: string
  spiritType: string
}

interface BlessingRecord {
  id: string
  blessingType: string
  createdAt: string
  user: { displayName: string | null }
}

const TYPE_EMOJI: Record<string, string> = {
  pet_cat: '🐱',
  pet_dog: '🐶',
  pet_other: '🐾',
  human: '👤',
}

const BLESSING_VERB: Record<string, string> = {
  candle: '点了一盏灯',
  flower: '献了一束花',
  prayer: '送上了祈福',
  charm: '送了护身符',
}

export default function BlessPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { ready, authenticated } = usePrivy()
  const authFetch = useAuthFetch()
  const [spirit, setSpirit] = useState<Spirit | null>(null)
  const [loading, setLoading] = useState(true)
  const [blessings, setBlessings] = useState<BlessingRecord[]>([])
  const [blessingCount, setBlessingCount] = useState(0)
  const [sending, setSending] = useState(false)
  const [actionError, setActionError] = useState('')

  // 动画状态
  const [animIcon, setAnimIcon] = useState('')
  const [showAnim, setShowAnim] = useState(false)

  // 加载spirit信息和祈福记录
  useEffect(() => {
    setActionError('')
    setLoading(true)

    if (!ready) return

    if (!authenticated) {
      setLoading(false)
      return
    }

    Promise.all([
      authFetch(`/api/spirit?id=${params.id}`),
      authFetch(`/api/bless?spiritId=${params.id}`),
    ])
      .then(async ([spiritRes, blessRes]) => {
        const spiritData = await readResponsePayload(spiritRes)
        const blessData = await readResponsePayload(blessRes)

        if (!spiritRes.ok || !(spiritData as { spirit?: Spirit }).spirit) {
          throw new Error((spiritData as { error?: string }).error || '找不到这个纪念空间')
        }
        if (!blessRes.ok) {
          throw new Error((blessData as { error?: string }).error || '祈福记录暂时不可用')
        }

        setSpirit((spiritData as { spirit: Spirit }).spirit)
        if ((blessData as { blessings?: BlessingRecord[] }).blessings) {
          setBlessings((blessData as { blessings: BlessingRecord[] }).blessings)
        }
        if (typeof (blessData as { count?: number }).count === 'number') {
          setBlessingCount((blessData as { count: number }).count)
        }
      })
      .catch((error) => {
        console.error(error)
        setSpirit(null)
        setActionError(error instanceof Error ? error.message : '祈福记录暂时不可用')
      })
      .finally(() => setLoading(false))
  }, [ready, authenticated, authFetch, params.id])

  const handleBless = useCallback(async (type: string) => {
    const item = BLESSING_ITEMS[type as keyof typeof BLESSING_ITEMS]
    if (!item || sending) return

    setSending(true)
    setActionError('')
    try {
      const res = await authFetch('/api/bless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spiritId: params.id, blessingType: type }),
      })

      const data = await readResponsePayload(res)
      if (!res.ok) throw new Error((data as { error?: string }).error || '祈福失败')

      // 触发动画
      setAnimIcon(item.icon)
      setShowAnim(true)
      setTimeout(() => setShowAnim(false), 1800)

      // 更新列表和计数
      setBlessingCount(prev => prev + 1)
      setBlessings(prev => [
        {
          id: (data as { blessing: { id: string; createdAt: string } }).blessing.id,
          blessingType: type,
          createdAt: (data as { blessing: { id: string; createdAt: string } }).blessing.createdAt,
          user: { displayName: '我' },
        },
        ...prev,
      ].slice(0, 20))
    } catch (err) {
      console.error('Bless error:', err)
      setActionError(err instanceof Error ? err.message : '祈福失败')
    } finally {
      setSending(false)
    }
  }, [authFetch, params.id, sending])

  // --- 渲染 ---

  if (!ready) {
    return (
      <AuthLoadingState
        title="正在准备祈福内测"
        body="我们正在确认登录状态和访问权限。要是这里停留太久，通常是登录服务还没完全就绪。"
      />
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-amber-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-light text-stone-700">登录后查看祈福内测</h1>
          <p className="mt-4 text-sm leading-7 text-stone-500">
            祈福当前仍是探索线，只对纪念空间创建者开放，用来验证轻量纪念动作是否有意义。
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

  if (!spirit) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-stone-400">{actionError || '找不到这个纪念空间，或你暂时没有查看权限。'}</p>
      </main>
    )
  }

  const emoji = TYPE_EMOJI[spirit.spiritType] || '🐾'

  return (
    <main className="min-h-screen bg-amber-50">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center mb-8">
          <button onClick={() => router.back()} className="text-stone-500 hover:text-stone-700">
            ←
          </button>
          <h1 className="flex-1 text-center text-stone-700">祈福记录内测</h1>
          <div className="w-6" />
        </div>

        <div className="mb-6 rounded-2xl bg-white px-4 py-4 text-sm leading-6 text-stone-500 shadow-sm">
          这是一条仍在验证中的纪念动作，只对创建者开放，不属于第一阶段对外主承诺。
        </div>

        {/* 分身形象 + 光芒 */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center shadow-lg shadow-amber-200/50">
              <span className="text-6xl">{emoji}</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-amber-300/20 animate-pulse" />
          </div>
        </div>

        {/* 祈福成功动画 */}
        {showAnim && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="flex flex-col items-center animate-bless-fade">
              <span className="text-7xl">{animIcon}</span>
              <p className="mt-3 text-stone-600 bg-white/90 rounded-full px-5 py-1.5 shadow text-sm">
                祈福成功
              </p>
            </div>
          </div>
        )}

        {/* 祈福选项 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {Object.entries(BLESSING_ITEMS).map(([type, item]) => (
            <button
              key={type}
              onClick={() => handleBless(type)}
              disabled={sending}
              className="bg-white rounded-2xl py-5 px-4 shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95 text-center disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="text-3xl block mb-2">{item.icon}</span>
              <p className="text-sm text-stone-700">{item.name}</p>
              <p className="text-xs text-amber-600 mt-1">¥{item.priceCny}</p>
            </button>
          ))}
        </div>

        {/* 祈福统计 */}
        <p className="text-center text-sm text-stone-400 mb-8">
          已有 <span className="text-amber-600 font-medium">{blessingCount}</span> 人为{spirit.name}祈福
        </p>
        {actionError && (
          <p className="mb-6 text-center text-sm text-red-500">{actionError}</p>
        )}

        {/* 最近祈福 */}
        {blessings.length > 0 && (
          <div>
            <h2 className="text-sm text-stone-400 mb-3">最近祈福</h2>
            <div className="space-y-2">
              {blessings.map((b) => {
                const bItem = BLESSING_ITEMS[b.blessingType as keyof typeof BLESSING_ITEMS]
                return (
                  <div key={b.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm">
                    <span className="text-lg">{bItem?.icon || '🙏'}</span>
                    <div className="flex-1">
                      <p className="text-sm text-stone-600">
                        {b.user.displayName || '匿名用户'} {BLESSING_VERB[b.blessingType] || '送上了祝福'}
                      </p>
                    </div>
                    <span className="text-xs text-stone-400">
                      {formatTimeAgo(b.createdAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-8">
          <FeedbackPromptCard
            href={`/feedback?source=memorial_bless&spiritId=${encodeURIComponent(spirit.id)}&spiritName=${encodeURIComponent(spirit.name)}`}
            title="祈福动作值得继续做吗？"
            body="它如果让你觉得有意义、太重、太轻、太像付费道具，或者你希望换一种纪念动作，都可以直接说。"
            cta="反馈祈福体验"
          />
        </div>
      </div>

      {/* 内联CSS动画 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blessFade {
          0% { opacity: 0; transform: scale(0.5) translateY(0); }
          30% { opacity: 1; transform: scale(1.2) translateY(-10px); }
          70% { opacity: 1; transform: scale(1) translateY(-20px); }
          100% { opacity: 0; transform: scale(0.8) translateY(-60px); }
        }
        .animate-bless-fade {
          animation: blessFade 1.8s ease-out forwards;
        }
      ` }} />
    </main>
  )
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  return `${Math.floor(diff / 86400)}天前`
}
