'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Spirit {
  id: string
  name: string
  spiritType: string
  photoUrls: string[]
  statuses: Array<{ content: string; mood: string }>
}

const TYPE_EMOJI: Record<string, string> = {
  pet_cat: '🐱',
  pet_dog: '🐶',
  pet_other: '🐾',
  human: '👤',
}

export default function DashboardPage() {
  const router = useRouter()
  const [spirits, setSpirits] = useState<Spirit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/spirit')
      .then(res => res.json())
      .then(data => setSpirits(data.spirits || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-stone-400">加载中...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-light text-stone-700 mb-6">我的彼岸世界</h1>

        {spirits.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-400 mb-4">还没有创建数字分身</p>
            <Link
              href="/create"
              className="inline-block py-3 px-8 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors"
            >
              为它创建一个新家
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {spirits.map(spirit => {
              const status = spirit.statuses?.[0]
              const emoji = TYPE_EMOJI[spirit.spiritType] || '🐾'
              return (
                <button
                  key={spirit.id}
                  onClick={() => router.push(`/spirit/${spirit.id}`)}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                >
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {spirit.photoUrls?.length > 0 ? (
                      <img src={spirit.photoUrls[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{emoji}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-700 font-medium">{spirit.name}</p>
                    <p className="text-sm text-stone-400 truncate">
                      {status?.content || '在彼岸世界安静地待着'}
                    </p>
                  </div>
                </button>
              )
            })}

            <Link
              href="/create"
              className="block w-full py-3 border-2 border-dashed border-stone-300 text-stone-400 rounded-2xl text-center hover:border-amber-400 hover:text-amber-500 transition-colors"
            >
              + 创建新的数字分身
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}