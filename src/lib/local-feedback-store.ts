import 'server-only'

import { appendFile, mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import type { FeedbackSubmissionInput } from './validations'

const localDataDir = path.join(process.cwd(), '.stillhere-local')
const feedbackLogPath = path.join(localDataDir, 'stillhere-feedback.ndjson')
const legacyFeedbackLogPath = path.join(process.cwd(), '.next', 'cache', 'stillhere-feedback.ndjson')

export async function appendLocalFeedbackSubmission(input: FeedbackSubmissionInput & {
  userId?: string | null
  createdAt?: string
}) {
  await mkdir(path.dirname(feedbackLogPath), { recursive: true })

  const payload = {
    ...input,
    userId: input.userId ?? null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  }

  await appendFile(feedbackLogPath, `${JSON.stringify(payload)}\n`, 'utf8')
}

export interface LocalFeedbackSubmissionRecord extends FeedbackSubmissionInput {
  userId: string | null
  createdAt: string
}

async function removeFeedbackFromFile(filePath: string, spiritId: string) {
  try {
    const raw = await readFile(filePath, 'utf8')
    const lines = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    let removed = 0
    const kept = lines.filter((line) => {
      try {
        const item = JSON.parse(line) as LocalFeedbackSubmissionRecord
        if (item.context?.spiritId === spiritId) {
          removed += 1
          return false
        }
      } catch {
        return true
      }

      return true
    })

    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, kept.length > 0 ? `${kept.join('\n')}\n` : '', 'utf8')
    return removed
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return 0
    }

    throw error
  }
}

export async function deleteLocalFeedbackSubmissionsBySpiritId(spiritId: string) {
  const removedCounts = await Promise.all([
    removeFeedbackFromFile(feedbackLogPath, spiritId),
    removeFeedbackFromFile(legacyFeedbackLogPath, spiritId),
  ])

  return removedCounts.reduce((sum, count) => sum + count, 0)
}

export async function listLocalFeedbackSubmissions(options?: {
  source?: string
  limit?: number
}) {
  try {
    const raw = await readFile(feedbackLogPath, 'utf8')
    const lines = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const submissions = lines
      .map((line) => JSON.parse(line) as LocalFeedbackSubmissionRecord)
      .filter((item) => !options?.source || item.context?.source === options.source)
      .sort((left, right) => {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      })

    if (!options?.limit || options.limit <= 0) {
      return submissions
    }

    return submissions.slice(0, options.limit)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      try {
        const raw = await readFile(legacyFeedbackLogPath, 'utf8')
        const lines = raw
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)

        const submissions = lines
          .map((line) => JSON.parse(line) as LocalFeedbackSubmissionRecord)
          .filter((item) => !options?.source || item.context?.source === options.source)
          .sort((left, right) => {
            return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
          })

        if (!options?.limit || options.limit <= 0) {
          return submissions
        }

        return submissions.slice(0, options.limit)
      } catch (legacyError) {
        if ((legacyError as NodeJS.ErrnoException).code === 'ENOENT') {
          return []
        }

        throw legacyError
      }
    }

    throw error
  }
}
