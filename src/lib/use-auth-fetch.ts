import { usePrivy } from '@privy-io/react-auth'
import { useCallback } from 'react'

export function useAuthFetch() {
  let getAccessToken: (() => Promise<string | null>) | null = null
  let ready = false

  try {
    const privy = usePrivy()
    ready = privy.ready
    getAccessToken = privy.getAccessToken
  } catch {
    // Privy not available
  }

  const authFetch = useCallback(async (url: string, options?: RequestInit) => {
    const headers = new Headers(options?.headers)

    if (ready && getAccessToken) {
      try {
        const token = await Promise.race([
          getAccessToken(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
        ])
        if (token) headers.set('Authorization', `Bearer ${token}`)
      } catch {
        // continue without auth
      }
    }

    return fetch(url, { ...options, headers })
  }, [getAccessToken, ready])

  return authFetch
}
