import { inferMood } from './ai-engine'

const REFUSAL_PATTERNS = [
  /^(sorry|apologies|i'?m sorry)\b/i,
  /\bi (can'?t|cannot|won'?t|am not able to|do not feel comfortable)\b/i,
  /i can't help/i,
  /i cannot help/i,
  /can't assist/i,
  /unable to assist/i,
  /not able to assist/i,
  /this request/i,
  /i appreciate you reaching out/i,
  /i need to let you know/i,
  /as an ai|language model|assistant/i,
  /role-?play|fictional|pretend|perspective of/i,
  /policy|guideline|unsafe|harmful/i,
  /memorial space/i,
  /deceased/i,
  /sensitive territory/i,
  /无法帮助|不能帮助|无法协助|不能协助|不适合协助|不便协助/,
  /作为.?ai|语言模型|这个请求|这个话题|敏感|有害|政策|准则|扮演|设定/,
]

const STATUS_PREFIX_PATTERNS = [
  /^(近况|状态|动态|今日近况|最近动态)\s*[:：-]\s*/i,
  /^["'“”‘’《》「」『』【】]+/,
  /["'“”‘’《》「」『』【】]+$/,
  /^[-*•]+\s*/,
]

export function normalizeStatusContent(content: string) {
  let normalized = content.replace(/\r\n/g, '\n').trim()

  STATUS_PREFIX_PATTERNS.forEach((pattern) => {
    normalized = normalized.replace(pattern, '')
  })

  normalized = normalized
    .replace(/\s+/g, ' ')
    .replace(/\s*([,.;!?])\s*/g, '$1 ')
    .trim()

  return normalized
}

export function looksLikeModelRefusal(content: string) {
  const normalized = normalizeStatusContent(content)
  if (!normalized) {
    return false
  }

  return REFUSAL_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function sanitizeStatusContent(content: string, fallback = '在纪念空间里安静待着') {
  const normalized = normalizeStatusContent(content)

  if (!normalized) {
    return fallback
  }

  return looksLikeModelRefusal(normalized) ? fallback : normalized
}

export function sanitizeStatusRecord<T extends { content: string; mood: string }>(
  status: T,
  fallback = '在纪念空间里安静待着'
) {
  const content = sanitizeStatusContent(status.content, fallback)
  return {
    ...status,
    content,
    mood: content === status.content ? status.mood : inferMood(content),
  }
}
