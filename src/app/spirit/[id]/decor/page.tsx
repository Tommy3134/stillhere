'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DECOR_ITEMS } from '@/lib/constants'

type DecorKey = keyof typeof DECOR_ITEMS

export default function DecorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [spirit, setSpirit] = useState<{ id: string; name: string; personality: { decor?: string[] } } | null>(null)
  const [owned, setOwned] = useState<DecorKey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/spirit?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.spirit) {
          setSpirit(data.spirit)
          const decor = (data.spirit.personality as { decor?: string[] })?.decor || ['cat_bed', 'food_bowl', 'toy_ball']
          setOwned(decor as DecorKey[])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  const addDecor = async (key: DecorKey) => {
    if (owned.includes(key)) return
    const item = DECOR_ITEMS[key]
    if (item.price > 0) {
      // TODO: 接入支付
      if (!confirm(`确定花 ¥${item.price} 购买${item.name}吗？`)) return
    }
    const newOwned = [...owned, key]
    setOwned(newOwned)

    // 保存到数据库
    await fetch(`/api/spirit/decor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spiritId: params.id, decor: newOwned }),
    })
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
          <h1 className="text-lg text-stone-700">{spirit?.name}的小屋</h1>
          <div className="w-8" />
        </div>

        {/* 已拥有的装饰 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <h2 className="text-sm text-stone-400 mb-3">已摆放</h2>
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
                      className={`flex flex-col items-center gap-1 py-4 rounded-xl border transition-colors ${
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
      </div>
    </main>
  )
}
