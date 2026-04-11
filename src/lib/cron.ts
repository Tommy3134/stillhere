import { NextRequest } from 'next/server'

export function isAuthorizedCronRequest(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()

  if (!secret) {
    return process.env.NODE_ENV !== 'production'
  }

  return req.headers.get('authorization') === `Bearer ${secret}`
}
