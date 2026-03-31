'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Answers {
  who: string; feeling: string; comeback: string; feature: string
  wanted: string; price: string; share: string; other: string
}

export default function FeedbackPage() {
  const [answers, setAnswers] = useState<Answers>({
    who: '', feeling: '', comeback: '', feature: '', wanted: '', price: '', share: '', other: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const set = (key: keyof Answers, val: string) => setAnswers(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async () => {
    setSending(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
    } catch { /* ok */ }
    setSubmitted(true)
    setSending(false)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <span className="text-6xl block">🕯️</span>
          <h1 className="text-2xl font-light text-stone-700">谢谢你</h1>
          <p className="text-stone-500">每一条反馈都会被认真读。</p>
          <p className="text-sm text-stone-400">Thank you. Every response matters.</p>
          <Link href="/" className="inline-block mt-4 py-3 px-8 bg-amber-600 text-white rounded-full">回到首页</Link>
        </div>
      </main>
    )
  }

  const R = (name: keyof Answers, opts: { v: string; l: string }[]) => (
    <div className="space-y-2">
      {opts.map(o => (
        <label key={o.v} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-colors ${answers[name] === o.v ? 'bg-amber-100 border-amber-300' : 'bg-white border-stone-200'}`}>
          <input type="radio" name={name} value={o.v} checked={answers[name] === o.v} onChange={() => set(name, o.v)} className="accent-amber-600" />
          <span className="text-sm text-stone-600">{o.l}</span>
        </label>
      ))}
    </div>
  )

  const Q = (n: string, name: keyof Answers, opts: { v: string; l: string }[]) => (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-stone-600">{n}</h2>
      {R(name, opts)}
    </div>
  )

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-light text-stone-700">Help us make StillHere better</h1>
          <p className="text-xs text-stone-400">A few quick questions. No right or wrong answers.</p>
        </div>
        {Q('1. Who did you create a spirit for?', 'who', [
          { v: 'cat', l: '🐱 Cat' }, { v: 'dog', l: '🐶 Dog' }, { v: 'other_pet', l: '🐾 Other pet' },
          { v: 'human', l: '👤 Family/friend' }, { v: 'trying', l: '🔍 Just trying it out' },
        ])}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-stone-600">2. How did you feel after creating the spirit?</h2>
          <textarea value={answers.feeling} onChange={e => set('feeling', e.target.value)} placeholder="Say anything..." className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400 resize-none h-24" />
        </div>
        {Q('3. Would you come back to visit?', 'comeback', [
          { v: 'often', l: '🟢 Yes, probably often' }, { v: 'occasionally', l: '🟡 Occasionally' },
          { v: 'unsure', l: '⚪ Not sure' }, { v: 'no', l: '🔴 Probably not' },
        ])}
        {Q('4. Which feature resonated most?', 'feature', [
          { v: 'chat', l: '💬 Chat' }, { v: 'status', l: '🌤️ Mood & status' },
          { v: 'bless', l: '🕯️ Blessings' }, { v: 'personality', l: '🎭 Personality' }, { v: 'scene', l: '🏠 Scene' },
        ])}
        {Q('5. What feature would you want most?', 'wanted', [
          { v: 'photos', l: '📸 More photos & memories' }, { v: 'proactive', l: '📩 Let them message me first' },
          { v: 'together', l: '👥 Visit with friends' }, { v: 'reminder', l: '📅 Anniversary reminders' }, { v: 'voice', l: '🎙️ Voice chat' },
        ])}
        {Q('6. If this were paid, what would you pay?', 'price', [
          { v: 'free', l: 'Free only' }, { v: 'once', l: 'One-time under $5' },
          { v: 'monthly', l: 'Under $2/month' }, { v: 'more', l: 'Would pay more for special features' },
        ])}
        {Q('7. Would you share this with someone who lost a pet?', 'share', [
          { v: 'yes', l: '✅ Yes, I have someone in mind' }, { v: 'maybe', l: '🤔 Maybe' }, { v: 'no', l: '❌ Probably not' },
        ])}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-stone-600">8. Anything else?</h2>
          <textarea value={answers.other} onChange={e => set('other', e.target.value)} placeholder="Anything at all..." className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-amber-400 resize-none h-24" />
        </div>
        <button onClick={handleSubmit} disabled={sending} className="w-full py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors disabled:opacity-50">
          {sending ? 'Submitting...' : 'Submit Feedback'}
        </button>
        <p className="text-center text-xs text-stone-400">🕯️ They mattered, and so does your feedback.</p>
      </div>
    </main>
  )
}