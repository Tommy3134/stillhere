'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function LoginButton({ className }: { className?: string }) {
  const router = useRouter()

  let privyAvailable = false
  let authenticated = false
  let login: (() => void) | null = null

  try {
    const privy = usePrivy()
    privyAvailable = true
    authenticated = privy.authenticated
    login = privy.login
  } catch {
    // Privy not available
  }

  useEffect(() => {
    if (authenticated) {
      router.push('/dashboard')
    }
  }, [authenticated, router])

  const handleClick = () => {
    if (privyAvailable && login) {
      login()
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <button onClick={handleClick} className={className}>
      为它创建一个新家
    </button>
  )
}
