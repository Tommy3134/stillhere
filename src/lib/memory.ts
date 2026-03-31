export interface SpiritMemory {
  facts: string[]
  preferences: string[]
  emotions: string[]
  lastTopics: string[]
}

const EMPTY_MEMORY: SpiritMemory = {
  facts: [],
  preferences: [],
  emotions: [],
  lastTopics: [],
}

export function getEmptyMemory(): SpiritMemory {
  return { ...EMPTY_MEMORY, facts: [], preferences: [], emotions: [], lastTopics: [] }
}

/**
 * 用AI从对话中提取新记忆，合并到已有记忆
 */
export async function extractMemory(
  messages: { role: string; content: string }[],
  existingMemory: Partial<SpiritMemory> | null | undefined,
): Promise<SpiritMemory> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return normalizeMem(existingMemory)
  }

  const mem = normalizeMem(existingMemory)

  // 只取最近的对话（控制token）
  const recent = messages.slice(-10)
  if (recent.length === 0) return mem

  const convo = recent
    .map((m) => `${m.role === 'user' ? '主人' : '宠物'}：${m.content}`)
    .join('\n')

  const prompt = `从以下对话中提取关于主人的关键信息。已有记忆如下，请合并新信息，去重，每类最多保留8条，优先保留最新最重要的。

已有记忆：
${JSON.stringify(mem)}

最近对话：
${convo}

返回JSON，格式严格如下，不要其他文字：
{"facts":["..."],"preferences":["..."],"emotions":["..."],"lastTopics":["..."]}`

  try {
    const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
    const res = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      console.error('Memory extraction API error:', res.status)
      return mem
    }

    const data = await res.json()
    const text: string = data?.content?.[0]?.text || ''

    // 从返回文本中提取JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return mem

    const parsed = JSON.parse(jsonMatch[0])
    return {
      facts: Array.isArray(parsed.facts) ? parsed.facts.slice(0, 8) : mem.facts,
      preferences: Array.isArray(parsed.preferences) ? parsed.preferences.slice(0, 8) : mem.preferences,
      emotions: Array.isArray(parsed.emotions) ? parsed.emotions.slice(0, 8) : mem.emotions,
      lastTopics: Array.isArray(parsed.lastTopics) ? parsed.lastTopics.slice(0, 8) : mem.lastTopics,
    }
  } catch (err) {
    console.error('Memory extraction failed:', err)
    return mem
  }
}

/**
 * 把记忆转成system prompt片段
 */
export function buildMemoryContext(memory: Partial<SpiritMemory> | null | undefined): string {
  const mem = normalizeMem(memory)
  const parts: string[] = []

  if (mem.facts.length > 0) {
    parts.push(`你记得关于主人的这些事：${mem.facts.join('；')}`)
  }
  if (mem.preferences.length > 0) {
    parts.push(`主人的偏好：${mem.preferences.join('；')}`)
  }
  if (mem.emotions.length > 0) {
    parts.push(`最近的情感记录：${mem.emotions.join('；')}`)
  }
  if (mem.lastTopics.length > 0) {
    parts.push(`最近聊过的话题：${mem.lastTopics.join('、')}`)
  }

  if (parts.length === 0) return ''
  return '\n\n【长期记忆】\n' + parts.join('\n')
}

function normalizeMem(raw: Partial<SpiritMemory> | null | undefined): SpiritMemory {
  if (!raw || typeof raw !== 'object') return getEmptyMemory()
  return {
    facts: Array.isArray(raw.facts) ? raw.facts : [],
    preferences: Array.isArray(raw.preferences) ? raw.preferences : [],
    emotions: Array.isArray(raw.emotions) ? raw.emotions : [],
    lastTopics: Array.isArray(raw.lastTopics) ? raw.lastTopics : [],
  }
}
