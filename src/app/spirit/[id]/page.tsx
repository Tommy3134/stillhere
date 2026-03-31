'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PixelPetEngine from '@/components/PixelPetEngine'

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
  personality: { tags: string[]; habits?: string; funnyStory?: string }
  homeStyle: string
  photoUrls: string[]
  statuses: SpiritStatus[]
}

export default function SpiritPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [spirit, setSpirit] = useState<Spirit | null>(null)
  const [loading, setLoading] = useState(true)
  const [neighbors, setNeighbors] = useState<Array<{ id: string; name: string; spiritType: string; photoUrls: string[] }>>([])
  const [showNeighbors, setShowNeighbors] = useState(false)

  useEffect(() => {
    fetch(`/api/spirit?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.spirit) setSpirit(data.spirit)
        if (data.neighbors) setNeighbors(data.neighbors)
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
        />

        <div className="flex items-center justify-center gap-2 mt-4 mb-6">
          <span className="text-sm text-stone-500">{moodInfo.label}</span>
          <span>{moodInfo.emoji}</span>
        </div>

        {/* 快捷操作 */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { icon: '💬', label: '聊天', action: () => router.push(`/chat/${spirit.id}`) },
            { icon: '🏠', label: '小屋', action: () => router.push(`/spirit/${spirit.id}/decor`) },
            { icon: '🙏', label: '祈福', action: () => router.push(`/spirit/${spirit.id}/bless`) },
            { icon: '👥', label: '邻居', action: () => setShowNeighbors(!showNeighbors) },
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

        {/* 邻居列表 */}
        {showNeighbors && (
          <div className="mb-8 animate-fade-in">
            <h2 className="text-sm text-stone-400 mb-3">
              {neighbors.length > 0 ? '彼岸世界的邻居们' : '附近还没有邻居'}
            </h2>
            {neighbors.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {neighbors.map(n => {
                  const emoji = n.spiritType === 'pet_cat' ? '🐱' : n.spiritType === 'pet_dog' ? '🐶' : n.spiritType === 'human' ? '👤' : '🐾'
                  return (
                    <button
                      key={n.id}
                      onClick={() => router.push(`/spirit/${n.id}`)}
                      className="flex flex-col items-center gap-1 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                        {n.photoUrls?.[0] ? (
                          <img src={n.photoUrls[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">{emoji}</span>
                        )}
                      </div>
                      <span className="text-xs text-stone-600">{n.name}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-stone-400 text-center py-4">创建更多分身，它们就会成为邻居</p>
            )}
          </div>
        )}

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
