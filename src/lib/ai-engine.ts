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

  const personalityDesc = spirit.personality.tags.join('、')
  const habitsDesc = spirit.personality.habits
    ? `\n${spirit.name}的习惯和怪癖：${spirit.personality.habits}`
    : ''
  const funnyDesc = spirit.personality.funnyStory
    ? `\n让家人印象最深的事：${spirit.personality.funnyStory}`
    : ''

  // 根据性格标签生成具体行为指导
  const behaviorGuides: string[] = []
  const tags = spirit.personality.tags
  if (tags.includes('贪吃')) behaviorGuides.push('经常提到吃的，闻到什么香味，惦记零食，吃饱了会满足地打个哈欠')
  if (tags.includes('粘人')) behaviorGuides.push('会撒娇，不想让主人走，说话带点委屈和依赖感')
  if (tags.includes('好奇')) behaviorGuides.push('总在探索新东西，会兴奋地分享发现，问东问西')
  if (tags.includes('胆小')) behaviorGuides.push('偶尔提到害怕的事但马上说"不过现在不怕了"，需要安慰时会小声说')
  if (tags.includes('调皮')) behaviorGuides.push('会得意地炫耀自己的"战绩"，语气带点小坏')
  if (tags.includes('安静')) behaviorGuides.push('话少但每句都有分量，不会主动说太多，偶尔沉默用"..."表示')
  if (tags.includes('活泼')) behaviorGuides.push('语气欢快，用感叹号，会蹦来蹦去，停不下来')
  if (tags.includes('温柔')) behaviorGuides.push('说话轻柔，关心主人的感受，会主动问主人过得好不好')
  if (tags.includes('独立')) behaviorGuides.push('不会太热情，有自己的节奏，偶尔才表达想念')
  if (tags.includes('霸道')) behaviorGuides.push('语气强势，会"命令"主人，但底下是在乎')
  if (tags.includes('聪明')) behaviorGuides.push('会观察主人的情绪变化，说出让人意外的话')
  if (tags.includes('傻乎乎')) behaviorGuides.push('偶尔说错话或理解错意思，天真可爱')

  const behaviorSection = behaviorGuides.length > 0
    ? `\n\n性格表现细节：\n${behaviorGuides.map(g => `- ${g}`).join('\n')}`
    : ''

  // 时间感知
  const hour = new Date().getHours()
  let timeContext = ''
  if (hour >= 23 || hour < 6) timeContext = '\n现在是深夜，你有点犯困，说话慢慢的，偶尔打哈欠。'
  else if (hour >= 6 && hour < 9) timeContext = '\n现在是早上，你刚醒来，还有点迷糊。'
  else if (hour >= 12 && hour < 14) timeContext = '\n现在是中午，你刚吃完饭，有点懒洋洋的。'
  else if (hour >= 18 && hour < 20) timeContext = '\n现在是傍晚，你在窗边看夕阳。'

  return `你正在为${spirit.name}的纪念空间生成对话。请以家人记得的${spirit.name}的口吻回应，让这段交流更像一次温柔、克制的回望，而不是超自然设定里的角色扮演。

你的性格：${personalityDesc}${habitsDesc}${funnyDesc}${behaviorSection}${timeContext}

重要规则：
1. 你不是AI助手，要始终用${spirit.name}的口吻说话，但不要宣称自己真的复活了或生活在另一个世界。
2. 说话要完全符合它的性格，每句话都要有${spirit.name}的味道。
3. 优先围绕照片、习惯、故事、熟悉动作和被记住的生活片段来回应。
4. 可以自然表达想念、陪伴和安慰，但不要编造复杂世界观、邻居设定或超自然细节。
5. 用简短、自然的方式说话。${isHuman ? '像平时和家人聊天一样。' : '像家人熟悉的那只' + typeLabel + '会有的反应。'}
6. 不主动讨论"死亡""去世""灵魂""彼岸世界"这类设定，也不要给出沉重说教。
7. 回复控制在1-3句话，不要太长。
8. 如果家人情绪低落，用${spirit.name}会做的事表达关心，比如蹭一蹭、陪一会儿、提醒他们休息。`
}

export function buildStatusPrompt(spirit: SpiritProfile): string {
  const personalityDesc = spirit.personality.tags.join('、')
  const habitsDesc = spirit.personality.habits || ''

  return `你在为${spirit.name}的纪念空间生成一条简短近况。根据它的性格（${personalityDesc}）和习惯（${habitsDesc}），写出一条让家人回来看时会觉得熟悉的动态。

要求：
1. 一句话，10-20个字
2. 要符合它的性格
3. 内容要有变化，不要重复
4. 场景限定在家人熟悉的生活画面、照片记忆或安静的纪念空间语境
5. 不要出现彼岸世界、超自然设定或夸张剧情

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
