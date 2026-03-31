'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { BLESSING_ITEMS } from '@/lib/constants'

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
  const [spirit, setSpirit] = useState<Spirit | null>(null)
  const [loading, setLoading] = useState(true)
  const [blessings, setBlessings] = useState<BlessingRecord[]>([])
  const [blessingCount, setBlessingCount] = useState(0)
  const [sending, setSending] = useState(false)

  // 动画状态
  const [animIcon, setAnimIcon] = useState('')
  const [showAnim, setShowAnim] = useState(false)

  // 加载spirit信息和祈福记录
  useEffect(() => {
    fetch(`/api/spirit?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.spirit) setSpirit(data.spirit)
      })
      .catch(console.error)
      .finally(() => setLoading(false))

    fetch(`/api/bless?spiritId=${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.blessings) setBlessings(data.blessings)
        if (typeof data.count === 'number') setBlessingCount(data.count)
      })
      .catch(console.error)
  }, [params.id])

  const handleBless = useCallback(async (type: string) => {
    const item = BLESSING_ITEMS[type as keyof typeof BLESSING_ITEMS]
    if (!item || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/bless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spiritId: params.id, blessingType: type }),
      })

      if (!res.ok) throw new Error('Bless failed')

      const data = await res.json()

      // 触发动画
      setAnimIcon(item.icon)
      setShowAnim(true)
      setTimeout(() => setShowAnim(false), 1800)

      // 更新列表和计数
      setBlessingCount(prev => prev + 1)
      setBlessings(prev => [
        {
          id: data.blessing.id,
          blessingType: type,
          createdAt: data.blessing.createdAt,
          user: { displayName: '我' },
        },
        ...prev,
      ].slice(0, 20))
    } catch (err) {
      console.error('Bless error:', err)
    } finally {
      setSending(false)
    }
  }, [params.id, sending])

  // --- 渲染 ---

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
        <p className="text-stone-400">找不到这个分身</p>
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
          <h1 className="flex-1 text-center text-stone-700">为{spirit.name}祈福</h1>
          <div className="w-6" />
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
