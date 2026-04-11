interface RoadmapPersonality {
  nickname?: string
  habits?: string
  funnyStory?: string
  birthday?: string
  passedDate?: string
}

interface RoadmapStatus {
  createdAt?: string | Date
}

interface MemorialRoadmapInput {
  name: string
  photoUrls: string[]
  shareEnabled?: boolean
  createdAt?: string | Date
  personality?: RoadmapPersonality
  statuses?: RoadmapStatus[]
}

export interface MemorialRoadmapItem {
  id: 'nickname' | 'dates' | 'photos' | 'story'
  title: string
  state: 'done' | 'next'
  hint: string
}

export interface MemorialTimelineItem {
  label: string
  value: string
  description: string
  timestamp: Date
}

export interface MemorialRoadmap {
  doneCount: number
  totalCount: number
  title: string
  summary: string
  nextStep: string
  items: MemorialRoadmapItem[]
}

function isDateString(value?: string) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function toDate(value?: string | Date | null) {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getMemorialRoadmap(input: MemorialRoadmapInput): MemorialRoadmap {
  const personality = input.personality || {}
  const items: MemorialRoadmapItem[] = [
    personality.nickname
      ? {
          id: 'nickname',
          title: '家人对它的称呼',
          state: 'done',
          hint: `已经写下“${personality.nickname}”，这个空间会更像你平时叫它的样子。`,
        }
      : {
          id: 'nickname',
          title: '家人对它的称呼',
          state: 'next',
          hint: '补上家里最常叫它的名字，会让这个空间一下子更亲近。',
        },
    isDateString(personality.birthday) || isDateString(personality.passedDate)
      ? {
          id: 'dates',
          title: '重要日子',
          state: 'done',
          hint: '生日或离开的日子已经留下来，回来时会更有纪念感。',
        }
      : {
          id: 'dates',
          title: '重要日子',
          state: 'next',
          hint: '把生日或离开的日子补上，以后到特别的那天，这里会更像真正的纪念空间。',
        },
    input.photoUrls.length >= 3
      ? {
          id: 'photos',
          title: '回忆相册',
          state: 'done',
          hint: `已经留下 ${input.photoUrls.length} 张照片，空间开始有画面感了。`,
        }
      : {
          id: 'photos',
          title: '回忆相册',
          state: 'next',
          hint: '再补 1 到 2 张最常想起的照片，回来看看时会更容易被拉回到具体记忆里。',
        },
    personality.habits && personality.funnyStory
      ? {
          id: 'story',
          title: '习惯和故事',
          state: 'done',
          hint: '它的习惯和最让人笑的一件事都在，这里已经不只是资料页了。',
        }
      : {
          id: 'story',
          title: '习惯和故事',
          state: 'next',
          hint: personality.habits || personality.funnyStory
            ? '还差一块回忆没写完，再补一点点，这里就会更像真正的它。'
            : '写下一个习惯或一件总会让你想起它的事，这会让这个空间更有温度。',
        },
  ]

  const doneCount = items.filter((item) => item.state === 'done').length
  const totalCount = items.length
  const nextItem = items.find((item) => item.state === 'next')

  if (doneCount <= 1) {
    return {
      doneCount,
      totalCount,
      title: `${input.name} 的纪念空间还在慢慢成形`,
      summary: '现在最重要的不是做更多功能，而是先把最基本的照片、称呼、故事和日子补完整。',
      nextStep: nextItem?.hint || '先补一件最容易想起的小事就很好。',
      items,
    }
  }

  if (doneCount < totalCount) {
    return {
      doneCount,
      totalCount,
      title: `${input.name} 的纪念空间已经开始有它自己的样子`,
      summary: '主干已经有了，接下来补齐剩下的一两块，这里就会更像你真正记得的它。',
      nextStep: nextItem?.hint || '可以顺手再补一件小事，让这个空间更完整。',
      items,
    }
  }

  return {
    doneCount,
    totalCount,
    title: `${input.name} 的纪念空间已经很完整了`,
    summary: input.shareEnabled
      ? '你已经把最重要的回忆补得很稳，也可以按自己的节奏决定要不要分享给亲友。'
      : '你已经把最重要的回忆补得很稳，之后回来看看这些照片和故事，本身就是有意义的事。',
    nextStep: '不一定每次都要新增内容。只是回来看看它留下来的样子，也是一种纪念。',
    items,
  }
}

export function getMemorialTimeline(input: MemorialRoadmapInput) {
  const personality = input.personality || {}
  const timeline: MemorialTimelineItem[] = []

  if (isDateString(personality.birthday)) {
    const date = new Date(`${personality.birthday}T00:00:00`)
    timeline.push({
      label: '生日',
      value: formatDate(date),
      description: '这是你记得它来到这个世界的日子。',
      timestamp: date,
    })
  }

  if (isDateString(personality.passedDate)) {
    const date = new Date(`${personality.passedDate}T00:00:00`)
    timeline.push({
      label: '离开的日子',
      value: formatDate(date),
      description: '这是你把想念和纪念重新安放的起点。',
      timestamp: date,
    })
  }

  const createdAt = toDate(input.createdAt)
  if (createdAt) {
    timeline.push({
      label: '建立纪念空间',
      value: formatDateTime(createdAt),
      description: '这是你第一次把这些回忆正式留在 StillHere 的时间。',
      timestamp: createdAt,
    })
  }

  const latestStatusDate = input.statuses
    ?.map((status) => toDate(status.createdAt))
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => right.getTime() - left.getTime())[0]

  if (latestStatusDate) {
    timeline.push({
      label: '最近一次纪念记录',
      value: formatDateTime(latestStatusDate),
      description: '这代表这个空间最近一次被新的状态和回忆轻轻点亮。',
      timestamp: latestStatusDate,
    })
  }

  return timeline.sort((left, right) => left.timestamp.getTime() - right.timestamp.getTime())
}
