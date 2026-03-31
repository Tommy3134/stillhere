'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const MOOD_CONFIG: Record<string, { emoji: string; bg: string; label: string }> = {
  sleepy: { emoji: '💤', bg: 'bg-blue-100', label: '犯困' },
  playful: { emoji: '🎮', bg: 'bg-yellow-100', label: '玩耍' },
  content: { emoji: '😊', bg: 'bg-green-100', label: '满足' },
  curious: { emoji: '🔍', bg: 'bg-purple-100', label: '好奇' },
  happy: { emoji: '✨', bg: 'bg-amber-100', label: '开心' },
}

const TYPE_EMOJI: Record<string, string> = {
  pet_cat: '🐱',
  pet_dog: '🐶',
  pet_other: '🐾',
  human: '👤',
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
  personality: { tags: string[]; habits?: string; funnyStory?: string }
  homeStyle: string
  photoUrls: string[]
  statuses: SpiritStatus[]
}

export default function SpiritPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [spirit, setSpirit] = useState<Spirit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/spirit?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.spirit) setSpirit(data.spirit)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

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

  const latestStatus = spirit.statuses[0]
  const mood = latestStatus?.mood || 'content'
  const statusText = latestStatus?.content || '在彼岸世界安静地待着'
  const moodInfo = MOOD_CONFIG[mood] || MOOD_CONFIG.content
  const emoji = TYPE_EMOJI[spirit.spiritType] || '🐾'

  return (
    <main className="min-h-screen bg-amber-50 pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* 分身形象 */}
        <div className="flex flex-col items-center mb-8">
          <div className={`w-32 h-32 rounded-full ${moodInfo.bg} flex items-center justify-center mb-4 overflow-hidden`}>
            {spirit.photoUrls?.length > 0 ? (
              <img src={spirit.photoUrls[0]} alt={spirit.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl">{emoji}</span>
            )}
          </div>
          <h1 className="text-2xl font-light text-stone-700">{spirit.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-stone-500">{statusText}</span>
            <span>{moodInfo.emoji}</span>
          </div>
        </div>

        {/* 状态卡片 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <p className="text-stone-600 text-center italic">
            &ldquo;{statusText}&rdquo;
          </p>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: '💬', label: '聊天', action: () => router.push(`/chat/${spirit.id}`) },
            { icon: '🏠', label: '小屋', action: () => {} },
            { icon: '🙏', label: '祈福', action: () => router.push(`/spirit/${spirit.id}/bless`) },
            { icon: '👥', label: '邻居', action: () => {} },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center gap-1 py-3 bg-white rounded-xl shadow-sm hover:bg-stone-50 transition-colors"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs text-stone-500">{item.label}</span>
            </button>
          ))}
        </div>

        {/* 照片相册 */}
        {spirit.photoUrls?.length > 1 && (
          <div className="mb-8">
            <h2 className="text-sm text-stone-400 mb-3">回忆相册</h2>
            <div className="grid grid-cols-3 gap-2">
              {spirit.photoUrls.map((url, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 最近动态 */}
        <div>
          <h2 className="text-sm text-stone-400 mb-3">最近动态</h2>
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
