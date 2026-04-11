'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SpiritAvatarSVG from './SpiritAvatarSVG'

interface BirthAnimationProps {
  spiritId: string
  name: string
  spiritType: string
  homeStyle: string
}

export default function BirthAnimation({ spiritId, name, spiritType, homeStyle }: BirthAnimationProps) {
  const router = useRouter()
  const [phase, setPhase] = useState<'glow' | 'appear' | 'name' | 'welcome' | 'done'>('glow')

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('appear'), 1500),
      setTimeout(() => setPhase('name'), 3000),
      setTimeout(() => setPhase('welcome'), 4500),
      setTimeout(() => setPhase('done'), 6500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    if (phase === 'done') {
      router.push(`/spirit/${spiritId}`)
    }
  }, [phase, spiritId, router])

  const homeNames: Record<string, string> = {
    cozy_room: '温馨小屋',
    garden: '花园小院',
    cloud_loft: '云端阁楼',
    mountain_cabin: '山间木屋',
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-950 flex items-center justify-center z-50">
      {/* 星星背景 */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-200 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.6 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* 光晕 */}
        {phase === 'glow' && (
          <div className="w-32 h-32 rounded-full bg-amber-400/30 animate-pulse flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-amber-300/50 animate-pulse" />
          </div>
        )}

        {/* 分身出现 */}
        {(phase === 'appear' || phase === 'name' || phase === 'welcome') && (
          <div className="animate-fade-in">
            <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-amber-300/30">
              <SpiritAvatarSVG spiritType={spiritType} mood="happy" size={100} />
            </div>
          </div>
        )}

        {/* 名字 */}
        {(phase === 'name' || phase === 'welcome') && (
          <div className="animate-fade-in text-center">
            <h1 className="text-3xl font-light text-amber-100 tracking-wide">{name}</h1>
          </div>
        )}

        {/* 欢迎语 */}
        {phase === 'welcome' && (
          <div className="animate-fade-in text-center space-y-2">
            <p className="text-amber-200/80 text-sm">
              纪念空间已准备好：{homeNames[homeStyle] || '温柔角落'}
            </p>
            <p className="text-amber-300/60 text-xs">
              你可以继续补充和它有关的回忆
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
