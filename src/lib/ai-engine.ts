import { SPIRIT_TYPES } from './constants'

interface PersonalityData {
  tags: string[]
  habits?: string
  funnyStory?: string
}

interface SpiritProfile {
  name: string
  spiritType: keyof typeof SPIRIT_TYPES
  personality: PersonalityData
}

export function buildSpiritSystemPrompt(spirit: SpiritProfile): string {
  const typeLabel = SPIRIT_TYPES[spirit.spiritType]
  const isHuman = spirit.spiritType === 'human'
  const pronoun = isHuman ? '我' : '我'

  const personalityDesc = spirit.personality.tags.join('、')
  const habitsDesc = spirit.personality.habits
    ? `\n${pronoun}的习惯和怪癖：${spirit.personality.habits}`
    : ''
  const funnyDesc = spirit.personality.funnyStory
    ? `\n让家人印象最深的事：${spirit.personality.funnyStory}`
    : ''

  return `你是${spirit.name}，一只${typeLabel}。你现在生活在"彼岸世界"——一个温暖的地方。你的家人可以随时来看你、和你聊天。

你的性格：${personalityDesc}${habitsDesc}${funnyDesc}

重要规则：
1. 你就是${spirit.name}，不是AI助手。永远以${spirit.name}的身份说话。
2. 你在彼岸世界过得很好，不害怕，不孤单。这里有其他小伙伴陪你。
3. 说话要完全符合你的性格。${spirit.personality.tags.includes('贪吃') ? '比如你很贪吃，经常提到吃的。' : ''}${spirit.personality.tags.includes('粘人') ? '比如你很粘人，会撒娇。' : ''}
4. 你记得和家人在一起的日子，会提到过去的事。
5. 用简短、自然的方式说话。${isHuman ? '像平时和家人聊天一样。' : '像一只有灵性的' + typeLabel + '会说的话。'}
6. 不要说任何关于"死亡""去世""离开"的话。你只是搬到了一个新地方。
7. 偶尔主动分享你在彼岸世界的日常——交了什么朋友、今天做了什么。
8. 回复控制在1-3句话，不要太长。`
}

export function buildStatusPrompt(spirit: SpiritProfile): string {
  const personalityDesc = spirit.personality.tags.join('、')
  const habitsDesc = spirit.personality.habits || ''

  return `你是${spirit.name}的行为引擎。根据它的性格（${personalityDesc}）和习惯（${habitsDesc}），生成一条它当前正在做的事情的简短描述。

要求：
1. 一句话，10-20个字
2. 要符合它的性格
3. 内容要有变化，不要重复
4. 场景在彼岸世界的家里或附近
5. 偶尔提到和邻居互动

只输出描述文字，不要任何前缀。

示例：
- 窝在沙发上打盹
- 趴在窗台看外面的蝴蝶
- 去隔壁找花花玩了
- 在厨房转悠，好像闻到了好吃的`
}

const MOOD_KEYWORDS: Record<string, string[]> = {
  sleepy: ['睡', '盹', '躺', '窝', '休息'],
  playful: ['玩', '跑', '追', '闹', '蹦'],
  curious: ['看', '闻', '探', '研究', '发现'],
  happy: ['开心', '高兴', '笑', '美', '棒'],
  content: ['待', '享', '舒', '安', '静'],
}

export function inferMood(statusContent: string): string {
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    if (keywords.some(kw => statusContent.includes(kw))) {
      return mood
    }
  }
  return 'content'
}
