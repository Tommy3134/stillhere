'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import { ConsentDialog } from './ConsentDialog'

export function ConsentGate({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy()
  const authFetch = useAuthFetch()
  const [consentChecked, setConsentChecked] = useState(false)
  const [needsConsent, setNeedsConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!ready || !authenticated) return

    let cancelled = false

    async function checkConsent() {
      try {
        const res = await authFetch('/api/consent')
        if (cancelled) return
        const data = await res.json()
        if (data.consentAccepted) {
          setConsentChecked(true)
        } else {
          setNeedsConsent(true)
        }
      } catch {
        setConsentChecked(true)
      }
    }

    checkConsent()

    return () => {
      cancelled = true
    }
  }, [ready, authenticated, authFetch])

  if (!ready || !authenticated) {
    return <>{children}</>
  }

  if (needsConsent) {
    return (
      <ConsentDialog
        isSubmitting={isSubmitting}
        onAccept={async () => {
          setIsSubmitting(true)
          try {
            await authFetch('/api/consent', { method: 'POST' })
            setNeedsConsent(false)
            setConsentChecked(true)
          } catch {
            setNeedsConsent(false)
            setConsentChecked(true)
          } finally {
            setIsSubmitting(false)
          }
        }}
      />
    )
  }

  if (!consentChecked) {
    return null
  }

  return <>{children}</>
}
