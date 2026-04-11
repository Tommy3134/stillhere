'use client'

import Link from 'next/link'

export function FeedbackPromptCard({
  href,
  title = '愿意给我们一点反馈吗？',
  body = 'StillHere 还在第一阶段打磨里。你刚刚体验到的顺手、不顺手、想补什么，都会直接影响下一轮施工。',
  cta = '去反馈',
}: {
  href: string
  title?: string
  body?: string
  cta?: string
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-sm text-stone-700">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-stone-500">{body}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-full border border-stone-300 px-5 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-100"
      >
        {cta}
      </Link>
    </div>
  )
}
