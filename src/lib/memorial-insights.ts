interface InsightPersonality {
  nickname?: string
  tags?: string[]
  habits?: string
  funnyStory?: string
  birthday?: string
  passedDate?: string
}

interface InsightStatus {
  createdAt?: string | Date
}

interface MemorialInsightInput {
  name: string
  photoUrls: string[]
  personality?: InsightPersonality
  statuses?: InsightStatus[]
}

export interface MemorialInsight {
  category: 'today' | 'upcoming' | 'memory' | 'settled'
  shortLabel: string
  title: string
  body: string
}

function isDateString(value?: string) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function getMonthDay(value: string) {
  return value.slice(5)
}

function getDaysUntilMonthDay(value: string, today = new Date()) {
  const [month, day] = getMonthDay(value).split('-').map(Number)
  const current = new Date(today)
  current.setHours(0, 0, 0, 0)

  const candidate = new Date(current.getFullYear(), month - 1, day)
  if (candidate.getTime() < current.getTime()) {
    candidate.setFullYear(candidate.getFullYear() + 1)
  }

  return Math.round((candidate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24))
}

export function getMemorialInsight(input: MemorialInsightInput, today = new Date()): MemorialInsight {
  const personality = input.personality || {}
  const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const birthday = isDateString(personality.birthday) ? personality.birthday : null
  const passedDate = isDateString(personality.passedDate) ? personality.passedDate : null

  if (passedDate && getMonthDay(passedDate) === mmdd) {
    return {
      category: 'today',
      shortLabel: '今天是特别的纪念日',
      title: `今天很适合回来看看 ${input.name}`,
      body: '今天是一个特别的日子。哪怕只回来安静地看一眼，或者补一句今天想到的话，也很有意义。',
    }
  }

  if (birthday && getMonthDay(birthday) === mmdd) {
    return {
      category: 'today',
      shortLabel: '今天是它的生日',
      title: `今天可以为 ${input.name} 留下一点新的纪念`,
      body: '生日会让很多回忆一下子亮起来。也许适合补一张照片，或者写下一个你最想记住的小瞬间。',
    }
  }

  const upcomingCandidates = [
    birthday
      ? { label: '生日', days: getDaysUntilMonthDay(birthday, today) }
      : null,
    passedDate
      ? { label: '纪念日', days: getDaysUntilMonthDay(passedDate, today) }
      : null,
  ].filter((item): item is { label: string; days: number } => Boolean(item))

  const nearestUpcoming = upcomingCandidates
    .filter((item) => item.days > 0 && item.days <= 30)
    .sort((left, right) => left.days - right.days)[0]

  if (nearestUpcoming) {
    return {
      category: 'upcoming',
      shortLabel: `再过 ${nearestUpcoming.days} 天是${nearestUpcoming.label}`,
      title: `${nearestUpcoming.label}快到了，可以提前把这个空间补完整一点`,
      body: '现在先补一张照片、一段习惯，或者一个最让人笑的故事，到了那天回来时会更像你真正记得的它。',
    }
  }

  if (input.photoUrls.length < 3) {
    return {
      category: 'memory',
      shortLabel: '还可以再补几张照片',
      title: `${input.name} 的纪念相册还在慢慢成形`,
      body: '照片往往是最容易让人回来看的入口。再补一两张你最常想起的画面，这个空间会一下子更完整。',
    }
  }

  if (!personality.funnyStory) {
    return {
      category: 'memory',
      shortLabel: '还缺一个名字故事',
      title: `这个空间还缺一件最像 ${input.name} 的事`,
      body: '写下那件总会让你想笑、或者一提起就会想到它的事，会让这里更像真正的纪念空间，而不只是资料页。',
    }
  }

  if (!personality.habits) {
    return {
      category: 'memory',
      shortLabel: '还可以补它的习惯',
      title: `${input.name} 的习惯会让回忆更具体`,
      body: '例如它听见什么声音会跑过来、最爱待在哪里、有什么小怪癖。这些细节会让你以后回来时更容易想起它。',
    }
  }

  return {
    category: 'settled',
    shortLabel: '今天也值得回来看看它',
    title: `${input.name} 的纪念空间已经有了自己的样子`,
    body: '不一定每次都要新增什么。只是回来看看它留下来的照片、故事和最近记录，本身就是这款产品最该成立的体验。',
  }
}
