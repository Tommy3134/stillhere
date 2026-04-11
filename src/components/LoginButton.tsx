'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function LoginButton({
  className,
  label = '开始创建纪念空间',
}: {
  className?: string
  label?: string
}) {
  const router = useRouter()
  const [error, setError] = useState('')

  let privyAvailable = false
  let ready = false
  let authenticated = false
  let login: (() => Promise<void> | void) | null = null

  try {
    const privy = usePrivy()
    privyAvailable = true
    ready = privy.ready
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

  const handleClick = async () => {
    setError('')

    if (privyAvailable && !ready) {
      setError('登录服务还在初始化，请等 2-3 秒后再试。')
      return
    }

    if (privyAvailable && login) {
      try {
        await Promise.resolve(login())
      } catch {
        setError('登录弹层没有成功打开，请检查 Privy 是否允许 localhost 域名。')
      }
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="space-y-2">
      <button onClick={handleClick} className={className} disabled={privyAvailable && !ready}>
        {privyAvailable && !ready ? '正在连接登录...' : label}
      </button>
      {error && <p className="text-center text-xs leading-5 text-red-500">{error}</p>}
    </div>
  )
}
