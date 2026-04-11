'use client'

import SpiritAvatarSVG from '@/components/SpiritAvatarSVG'

interface ChatHeaderProps {
  name: string
  avatarEmoji?: string
  spiritType?: string
  onBack: () => void
}

export default function ChatHeader({ name, spiritType, onBack }: ChatHeaderProps) {
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
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow overflow-hidden">
            <SpiritAvatarSVG spiritType={spiritType || 'pet_cat'} mood="happy" size={44} />
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        </div>
        <span className="text-sm font-medium text-stone-700">{name}</span>
        <span className="text-xs text-stone-400">纪念对话内测</span>
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
