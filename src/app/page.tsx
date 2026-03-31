'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LoginButton } from '@/components/LoginButton'

export default function Home() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch('/api/spirit')
      .then(res => res.json())
      .then(data => setCount(data.spirits?.length || 0))
      .catch(() => {})
  }, [])
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
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

        {/* 动画占位 - 后续替换为真实动画 */}
        <div className="w-48 h-48 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
          <span className="text-6xl">🐱</span>
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
          已有 <span className="text-amber-600 font-medium">{count}</span> 个生命在这里生活
        </p>
      </div>
    </main>
  )
}
