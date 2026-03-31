import { usePrivy } from '@privy-io/react-auth'
import { useCallback } from 'react'

export function useAuthFetch() {
  let getAccessToken: (() => Promise<string | null>) | null = null

  try {
    const privy = usePrivy()
    getAccessToken = privy.getAccessToken
  } catch {
    // Privy not available
  }

  const authFetch = useCallback(async (url: string, options?: RequestInit) => {
    const headers = new Headers(options?.headers)

    if (getAccessToken) {
      try {
        const token = await getAccessToken()
        if (token) headers.set('Authorization', `Bearer ${token}`)
      } catch {
        // continue without auth
      }
    }

    return fetch(url, { ...options, headers })
  }, [getAccessToken])

  return authFetch
}
