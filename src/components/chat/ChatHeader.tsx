'use client'

interface ChatHeaderProps {
  name: string
  avatarEmoji?: string
  onBack: () => void
}

export default function ChatHeader({ name, avatarEmoji = '🐱', onBack }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-amber-100/80 backdrop-blur rounded-b-3xl shadow-sm">
      <button
        type="button"
        onClick={onBack}
        className="w-10 h-10 flex items-center justify-center rounded-full text-2xl text-stone-600 hover:bg-white"
        aria-label="返回"
      >
        ←
      </button>

      <div className="flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow">
          {avatarEmoji}
        </div>
        <span className="text-sm text-stone-600">{name}</span>
      </div>

      <button
        type="button"
        className="w-10 h-10 flex items-center justify-center rounded-full text-xl text-stone-500 hover:bg-white"
        aria-label="更多"
      >
        ···
      </button>
    </header>
  )
}
