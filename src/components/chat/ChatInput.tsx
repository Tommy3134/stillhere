'use client'

import { useState } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function ChatInput({ onSend, disabled = false, placeholder = '说点什么...' }: ChatInputProps) {
  const [value, setValue] = useState('')

  const sendMessage = () => {
    const content = value.trim()
    if (!content || disabled) return
    onSend(content)
    setValue('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const isDisabled = disabled || value.trim() === ''

  return (
    <div className="sticky bottom-0 flex items-end gap-3 px-4 py-3 bg-amber-50/70 backdrop-blur-md border-t border-amber-100">
      <textarea
        value={value}
        onChange={event => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="flex-1 resize-none rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-amber-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={sendMessage}
        disabled={isDisabled}
        className={`w-12 h-12 rounded-full text-xl text-white transition-colors ${
          isDisabled ? 'bg-stone-200 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500'
        }`}
        aria-label="发送"
      >
        →
      </button>
    </div>
  )
}
