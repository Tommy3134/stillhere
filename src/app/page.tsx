'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoginButton } from '@/components/LoginButton'

interface Spirit {
  id: string
  name: string
  spiritType: string
  photoUrls: string[]
  statuses: Array<{ content: string }>
}

const SPIRIT_EMOJI: Record<string, string> = {
  cat: '🐱', dog: '🐶', bird: '🐦', rabbit: '🐰',
  hamster: '🐹', fish: '🐠', human: '👤',
}

export default function Home() {
  const [spirits, setSpirits] = useState<Spirit[]>([])

  useEffect(() => {
    fetch('/api/spirit')
      .then(res => res.json())
      .then(data => setSpirits(data.spirits || []))
      .catch(() => {})
  }, [])

  const displaySpirits = spirits.slice(0, 6)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 标题区 */}
        <div className="space-y-3">
          <h1 className="text-4xl font-light tracking-wide text-stone-700">
            仍在
          </h1>
          <p className="text-sm text-stone-400 tracking-widest">STILLHERE</p>
        </div>

        {/* 情感文案 */}
        <div className="space-y-2 py-8">
          <p className="text-lg text-stone-600 leading-relaxed">
            它们没有离开，
          </p>
          <p className="text-lg text-stone-600 leading-relaxed">
            只是去了另一个地方。
          </p>
        </div>

        {/* 动画展示 */}
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 rounded-full bg-amber-200/30 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full bg-amber-100/50 animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="relative w-full h-full rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-6xl animate-bounce" style={{ animationDuration: '3s' }}>
              {displaySpirits.length > 0
                ? (SPIRIT_EMOJI[displaySpirits[0].spiritType] || '🐾')
                : '🐱'}
            </span>
          </div>
        </div>

        {/* CTA按钮 */}
        <div className="space-y-3 pt-8">
          <LoginButton
            className="block w-full py-3 px-6 bg-amber-600 text-white rounded-full text-center hover:bg-amber-700 transition-colors"
          />
          <Link
            href="/dashboard"
            className="block w-full py-3 px-6 border border-stone-300 text-stone-600 rounded-full text-center hover:bg-stone-100 transition-colors"
          >
            先看看彼岸世界
          </Link>
        </div>

        {/* 底部统计 */}
        <p className="text-sm text-stone-400 pt-4">
          已有 <span className="text-amber-600 font-medium">{spirits.length}</span> 个生命在这里生活
        </p>
      </div>

      {/* 彼岸世界的居民 */}
      {displaySpirits.length > 0 && (
        <div className="max-w-lg w-full mt-16 space-y-6">
          <h2 className="text-center text-lg font-light text-stone-500 tracking-wide">
            彼岸世界的居民
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {displaySpirits.map(spirit => (
              <Link
                key={spirit.id}
                href={`/share/${spirit.id}`}
                className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  {spirit.photoUrls?.[0] ? (
                    <img
                      src={spirit.photoUrls[0]}
                      alt={spirit.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                      <span className="text-3xl">
                        {SPIRIT_EMOJI[spirit.spiritType] || '✨'}
                      </span>
                    </div>
                  )}
                  <p className="text-sm font-medium text-stone-700">{spirit.name}</p>
                  {spirit.statuses?.[0]?.content && (
                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {spirit.statuses[0].content}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
