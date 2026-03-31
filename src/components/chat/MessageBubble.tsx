'use client'

import SpiritAvatarSVG from '@/components/SpiritAvatarSVG'

interface MessageBubbleProps {
  content: string
  role: 'user' | 'spirit'
  timestamp?: string
  spiritType?: string
}

export default function MessageBubble({ content, role, timestamp, spiritType }: MessageBubbleProps) {
  const isUser = role === 'user'
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-[fadeIn_0.3s_ease-in]`}>
      <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center shrink-0 overflow-hidden">
            <SpiritAvatarSVG spiritType={spiritType || 'pet_cat'} mood="content" size={30} />
          </div>
        )}
        <div
          className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words ${
            isUser
              ? 'bg-blue-100 text-stone-700 rounded-tr-none'
              : 'bg-white text-stone-700 rounded-tl-none shadow-sm'
          }`}
        >
          {content}
        </div>
      </div>
      {timestamp && <span className="mt-1 text-xs text-stone-400">{timestamp}</span>}
    </div>
  )
}
