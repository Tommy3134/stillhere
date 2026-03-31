'use client'

import { useEffect, useState } from 'react'
import SpiritAvatarSVG from './SpiritAvatarSVG'

type Mood = 'sleepy' | 'playful' | 'content' | 'curious' | 'happy'

const MOOD_ANIMATIONS: Record<Mood, string> = {
  sleepy: 'animate-breathe',
  playful: 'animate-bounce-gentle',
  content: 'animate-breathe',
  curious: 'animate-look-around',
  happy: 'animate-bounce-gentle',
}

interface SpiritSceneProps {
  name: string
  spiritType: string
  mood: Mood
  photoUrl?: string
  homeStyle: string
  statusText: string
}

export default function SpiritScene({ name, spiritType, mood, photoUrl, homeStyle, statusText }: SpiritSceneProps) {
  const [showBubble, setShowBubble] = useState(true)
  const animation = MOOD_ANIMATIONS[mood] || 'animate-breathe'

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(false), 5000)
    return () => clearTimeout(timer)
  }, [statusText])

  useEffect(() => {
    setShowBubble(true)
  }, [statusText])

  const bgGradient: Record<string, string> = {
    cozy_room: 'from-amber-100 via-orange-50 to-amber-50',
    garden: 'from-green-100 via-emerald-50 to-lime-50',
    cloud_loft: 'from-blue-100 via-sky-50 to-indigo-50',
    mountain_cabin: 'from-stone-200 via-amber-50 to-stone-100',
  }

  return (
    <div className={`relative w-full aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden bg-gradient-to-b ${bgGradient[homeStyle] || bgGradient.cozy_room}`}>
      {/* 场景装饰 */}
      <SceneDecor homeStyle={homeStyle} />

      {/* 分身形象 */}
      <div className={`absolute bottom-[20%] left-1/2 -translate-x-1/2 ${animation}`}>
        {photoUrl ? (
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <SpiritAvatar spiritType={spiritType} mood={mood} />
        )}
      </div>

      {/* 状态气泡 */}
      {showBubble && (
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 animate-fade-in">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm max-w-[200px]">
            <p className="text-xs text-stone-600 text-center">{statusText}</p>
          </div>
          <div className="w-3 h-3 bg-white/90 rounded-full mx-auto mt-1" />
          <div className="w-2 h-2 bg-white/90 rounded-full mx-auto mt-0.5" />
        </div>
      )}

      {/* 名字 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <span className="text-sm text-stone-500 font-medium">{name}</span>
      </div>
    </div>
  )
}

function SpiritAvatar({ spiritType, mood }: { spiritType: string; mood: Mood }) {
  return (
    <div className="w-24 h-24 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
      <SpiritAvatarSVG spiritType={spiritType} mood={mood} size={80} />
    </div>
  )
}

function SceneDecor({ homeStyle }: { homeStyle: string }) {
  if (homeStyle === 'cozy_room') {
    return (
      <>
        {/* 窗户 */}
        <div className="absolute top-6 right-6 w-16 h-20 rounded-t-full bg-sky-200/60 border-2 border-amber-300/40">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[1px] h-full bg-amber-300/40" />
            <div className="absolute w-full h-[1px] bg-amber-300/40 top-1/2" />
          </div>
        </div>
        {/* 地板 */}
        <div className="absolute bottom-0 w-full h-[18%] bg-amber-200/50" />
        {/* 小地毯 */}
        <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-32 h-8 rounded-full bg-rose-200/40" />
        {/* 猫爬架 */}
        <div className="absolute bottom-[18%] left-6 w-8 h-24 bg-amber-300/30 rounded-t-lg" />
        <div className="absolute bottom-[42%] left-3 w-14 h-3 bg-amber-300/40 rounded" />
      </>
    )
  }
  if (homeStyle === 'garden') {
    return (
      <>
        <div className="absolute bottom-0 w-full h-[25%] bg-green-200/50" />
        {/* 花 */}
        <div className="absolute bottom-[22%] left-8 text-2xl">🌷</div>
        <div className="absolute bottom-[20%] right-10 text-2xl">🌻</div>
        <div className="absolute bottom-[24%] left-[40%] text-lg">🌸</div>
        {/* 树 */}
        <div className="absolute bottom-[25%] right-4 text-4xl">🌳</div>
        {/* 蝴蝶 */}
        <div className="absolute top-[20%] left-[20%] text-lg animate-float">🦋</div>
      </>
    )
  }
  if (homeStyle === 'cloud_loft') {
    return (
      <>
        <div className="absolute top-[15%] left-4 text-3xl opacity-40 animate-float-slow">☁️</div>
        <div className="absolute top-[25%] right-8 text-2xl opacity-30 animate-float">☁️</div>
        <div className="absolute top-[10%] left-[45%] text-xl opacity-20 animate-float-slow">☁️</div>
        {/* 平台 */}
        <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-40 h-12 rounded-full bg-white/40" />
        {/* 星星 */}
        <div className="absolute top-4 left-10 text-sm animate-twinkle">✨</div>
        <div className="absolute top-8 right-16 text-xs animate-twinkle-delay">⭐</div>
      </>
    )
  }
  // mountain_cabin
  return (
    <>
      <div className="absolute bottom-0 w-full h-[20%] bg-stone-300/40" />
      {/* 山 */}
      <div className="absolute top-[10%] left-0 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[80px] border-transparent border-b-stone-300/30" />
      <div className="absolute top-[5%] right-4 w-0 h-0 border-l-[40px] border-r-[40px] border-b-[60px] border-transparent border-b-stone-400/20" />
      {/* 小木屋 */}
      <div className="absolute bottom-[20%] left-6 w-16 h-12 bg-amber-700/30 rounded-t-lg" />
      <div className="absolute bottom-[30%] left-4 w-20 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-amber-800/30" />
    </>
  )
}
