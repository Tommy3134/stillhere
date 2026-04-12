'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

function isPublicEntryPath(pathname: string) {
  if (pathname === '/' || pathname === '/beta' || pathname === '/feedback' || pathname === '/sample' || pathname === '/privacy') {
    return true
  }

  return pathname.startsWith('/share/') || pathname.startsWith('/sample/')
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const pathname = usePathname()
  const shouldLoadPrivy = !isPublicEntryPath(pathname)
  const content = (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  if (!shouldLoadPrivy) {
    return content
  }

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'google', 'apple'],
        appearance: {
          theme: 'light',
          accentColor: '#d97706', // amber-600
          logo: undefined,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {content}
    </PrivyProvider>
  )
}
