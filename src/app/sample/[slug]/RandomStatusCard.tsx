'use client'

import { useState } from 'react'

interface RandomStatusCardProps {
  statuses: string[]
  signature: string
}

export function RandomStatusCard({ statuses, signature }: RandomStatusCardProps) {
  const [selectedStatus] = useState(() => {
    if (statuses.length === 0) {
      return ''
    }

    return statuses[Math.floor(Math.random() * statuses.length)]
  })

  return (
    <div className="rounded-[2rem] border border-stone-200/70 bg-white px-6 py-10 shadow-[0_24px_80px_rgba(90,72,42,0.08)] md:px-12 md:py-14">
      <p className="text-center text-2xl font-medium leading-[1.9] text-stone-700 md:text-3xl md:leading-[1.85]">
        {selectedStatus}
      </p>
      <p className="mt-6 text-right text-sm tracking-[0.16em] text-stone-400">{signature}</p>
    </div>
  )
}
