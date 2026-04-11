interface FeedbackReviewUser {
  email?: string | null
  privyId?: string | null
}

function parseCsvEnv(value?: string) {
  return new Set(
    (value || '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  )
}

export function canReviewFeedback(user: FeedbackReviewUser | null) {
  if (!user) {
    return false
  }

  if (process.env.NODE_ENV !== 'production') {
    return true
  }

  const allowedEmails = parseCsvEnv(process.env.FEEDBACK_REVIEWER_EMAILS)
  const allowedPrivyIds = parseCsvEnv(process.env.FEEDBACK_REVIEWER_PRIVY_IDS)
  const userEmail = user.email?.toLowerCase() || ''
  const userPrivyId = user.privyId?.toLowerCase() || ''

  if (allowedEmails.size > 0 && userEmail && allowedEmails.has(userEmail)) {
    return true
  }

  if (allowedPrivyIds.size > 0 && userPrivyId && allowedPrivyIds.has(userPrivyId)) {
    return true
  }

  return false
}
