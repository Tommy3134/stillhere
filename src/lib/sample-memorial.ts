export interface SampleMemorialStatus {
  id: string
  content: string
  mood: 'content' | 'playful' | 'sleepy' | 'curious'
  createdAt: string
}

export interface SampleMemorial {
  slug: string
  name: string
  nickname: string
  spiritType: 'pet_cat' | 'pet_dog' | 'pet_other'
  summary: string
  introduction: string
  returnReason: string
  ownerLetter: string
  photoUrls: string[]
  personality: {
    birthday: string
    passedDate: string
    tags: string[]
    habits: string
    funnyStory: string
  }
  statuses: SampleMemorialStatus[]
}

const momo: SampleMemorial = {
  slug: 'momo',
  name: '墨墨',
  nickname: '小墨',
  spiritType: 'pet_cat',
  summary: '这里放着它晒太阳的窗台、睡成一团的午后，还有那些一想到就会忍不住停一下的细节。',
  introduction: '一只总爱贴着窗边取暖、又会在半夜把玩具叼到床边的小玳瑁猫。',
  returnReason: '像把照片、习惯和想念都安静放回原位',
  ownerLetter: '它不是那种会一直黏人的猫，但你一难过，它就会自己走过来趴下。现在每次下午的太阳照进房间，我还是会下意识看一眼窗台，像它还会在那里伸懒腰。',
  photoUrls: [
    '/sample/momo-window.jpg',
    '/sample/momo-stretch.jpg',
    '/sample/momo-sleep.jpg',
    '/sample/momo-closeup.jpg',
  ],
  personality: {
    birthday: '2022-08-17',
    passedDate: '2025-11-09',
    tags: ['爱晒太阳', '会叼玩具', '有点倔', '轻轻蹭人', '下午最黏人'],
    habits: '每天傍晚都会先去窗边坐一会儿，再慢慢绕到床上找最热的位置。听到零食袋会跑来，但一定要先装作没兴趣地看你两秒。',
    funnyStory: '它很爱把小毛球叼到床边，放下之后还会认真看着你，像在交接今天巡逻的战利品。有一次半夜被它的小毛球砸醒，睁眼就看到它一脸坦然地坐在旁边。',
  },
  statuses: [
    {
      id: 'sample-status-1',
      content: '今天又翻到它趴在窗台晒太阳的照片，还是会忍不住停下来多看一会儿。',
      mood: 'content',
      createdAt: '2026-04-06T18:10:00+08:00',
    },
    {
      id: 'sample-status-2',
      content: '最近总会想起它半夜把玩具叼到床边，像在认真完成自己的值夜班。',
      mood: 'playful',
      createdAt: '2026-04-03T21:40:00+08:00',
    },
    {
      id: 'sample-status-3',
      content: '每次看到枕头上的太阳光，都会想到它把自己团成一小团睡着的样子。',
      mood: 'sleepy',
      createdAt: '2026-03-29T14:25:00+08:00',
    },
    {
      id: 'sample-status-4',
      content: '朋友来家里时，还是会有人下意识看门后，好像它还会探头出来打量一下。',
      mood: 'curious',
      createdAt: '2026-03-22T10:05:00+08:00',
    },
  ],
}

const SAMPLE_MEMORIALS: Record<string, SampleMemorial> = {
  [momo.slug]: momo,
}

export const defaultSampleMemorial = momo

export function getSampleMemorial(slug: string) {
  return SAMPLE_MEMORIALS[slug] || null
}
