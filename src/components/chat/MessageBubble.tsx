'use client'

interface MessageBubbleProps {
  content: string
  role: 'user' | 'spirit'
  timestamp?: string
}

const SPIRIT_EMOJI = '🐱'

export default function MessageBubble({ content, role, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user'
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-xl">
            {SPIRIT_EMOJI}
          </div>
        )}
        <div
          className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words ${
            isUser
              ? 'bg-amber-500 text-white rounded-tr-none'
              : 'bg-white text-stone-700 rounded-tl-none'
          }`}
        >
          {content}
        </div>
      </div>
      {timestamp && <span className="mt-1 text-xs text-stone-400">{timestamp}</span>}
    </div>
  )
}
