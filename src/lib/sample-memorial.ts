export interface SampleMemorialTraitCard {
  imageUrl: string
  title: string
  paragraphs: string[]
}

export interface SampleMemorial {
  slug: string
  name: string
  heroImageUrl: string
  generatedImageUrls: string[]
  galleryImageUrls: string[]
  hero: {
    title: string
    subtitleLines: string[]
    declarationParagraphs: string[]
    scrollLabel: string
  }
  about: {
    title: string
    facts: string[]
    accentImageUrl: string
  }
  traits: {
    title: string
    cards: SampleMemorialTraitCard[]
  }
  currentMoment: {
    title: string
    signature: string
    statuses: string[]
  }
  ownerLetter: {
    title: string
    paragraphs: string[]
    videoUrl: string
    videoPosterUrl: string
    videoCaption: string
  }
  cta: {
    title: string
    paragraphs: string[]
    primaryLabel: string
    primaryHref: string
    primaryNote: string
    secondaryLabel: string
    secondaryHref: string
  }
}

const shixiaoyuan: SampleMemorial = {
  slug: 'shixiaoyuan',
  name: '史小圆',
  heroImageUrl: '/sample/shixiaoyuan/generated/01-natural-memorial_att2_c0_i0.png',
  generatedImageUrls: [
    '/sample/shixiaoyuan/generated/01-natural-memorial_att1_c0_i0.png',
    '/sample/shixiaoyuan/generated/01-natural-memorial_att2_c0_i0.png',
    '/sample/shixiaoyuan/generated/01-natural-memorial_att3_c0_i0.png',
  ],
  galleryImageUrls: [
    '/sample/shixiaoyuan/photos/IMG_0EE48CB9-ACE2-43D1-A6EF-4602D239C194.JPG',
    '/sample/shixiaoyuan/photos/IMG_8575.jpg',
    '/sample/shixiaoyuan/photos/IMG_9605.jpg',
    '/sample/shixiaoyuan/photos/IMG_0152.JPG',
    '/sample/shixiaoyuan/photos/IMG_4910.jpg',
    '/sample/shixiaoyuan/photos/IMG_5529.jpg',
    '/sample/shixiaoyuan/photos/IMG_7402.jpg',
    '/sample/shixiaoyuan/photos/IMG_0982.jpg',
  ],
  hero: {
    title: '这是史小圆的纪念空间。',
    subtitleLines: [
      '它是一只玳瑁猫。好奇,贪吃,喜欢吃人的手指。',
      '用户和老婆出门了会害怕。',
      '它已经不在了。',
    ],
    declarationParagraphs: [
      '这是一个示例纪念空间。这里的故事大部分是骨架,是作者根据一些零碎的线索合成的,不是真实的完整纪念。小圆的主人以后会亲自替换掉这些内容。',
      '做这个示例,是因为我们相信:在你决定是否要为你的猫/狗留一个这样的空间之前,你应该先看到一个完成后的大概样子。',
    ],
    scrollLabel: '⬇ 向下看',
  },
  about: {
    title: '关于小圆',
    facts: [
      '🐈  猫 · 玳瑁花纹',
      '🎨  黑色和浅棕混合,脸部左右不对称',
      '👁   眼睛偏黄绿',
      '🏠  跟着主人,走哪儿跟哪儿',
      '⛩   主人给它求过寺庙的福',
    ],
    accentImageUrl: '/sample/shixiaoyuan/generated/01-natural-memorial_att1_c0_i0.png',
  },
  traits: {
    title: '它是这样一只猫',
    cards: [
      {
        imageUrl: '/sample/shixiaoyuan/photos/IMG_0168.JPG',
        title: '它咬你的手指,但不会真的咬',
        paragraphs: [
          '小圆对所有柔软的东西都好奇,最好奇的是主人的手。',
          '主人坐下来看电脑,它就会从某个角落冒出来,凑到手边。先用脸蹭一下,然后用牙叼住主人的手指 — 是那种很小心的叼,像叼一个易碎的东西。',
          '主人不抽手,它就一直叼着。有时候主人说"小圆你干嘛",它就抬头看一眼,然后继续叼。',
        ],
      },
      {
        imageUrl: '/sample/shixiaoyuan/photos/IMG_9247.jpg',
        title: '主人出门的日子,它会躲起来',
        paragraphs: [
          '它不是那种喜欢独处的猫。',
          '主人和老婆出门,家里空下来,它就会躲到某个只属于它自己的小角落。不是害怕陌生人,是害怕"没有主人的家"。',
          '主人回来,它会先远远看一眼,确认是主人,然后慢慢走过来 — 不是扑过来,是慢慢地、好像什么都没发生一样,走过来蹭一下腿。',
        ],
      },
      {
        imageUrl: '/sample/shixiaoyuan/photos/IMG_5529.jpg',
        title: '桌上的每一个新东西,它都要过来看一眼',
        paragraphs: [
          '主人买了一盒新零食,它必须凑过来闻一下。',
          '主人的手机放在桌上发光,它必须用爪子拨一下。',
          '主人的外卖箱刚打开,它不吃那个东西,但一定要进箱子里坐一会儿。',
          '不是为了吃,是"我要先知道这是什么"。',
        ],
      },
    ],
  },
  currentMoment: {
    title: '小圆此刻',
    signature: '— 由主人的故事生成',
    statuses: [
      '小圆刚才想你了 — 它凑到桌边,以为你在。',
      '小圆今天想叼你的手指,但你的手不在。',
      '有只陌生的猫从窗外经过,小圆看了很久。',
      '小圆躲在沙发底下,它以为你出门了。',
      '小圆坐在你的椅子上,像你在时它常做的那样。',
      '你的外卖盒今天被小圆占领了 3 分钟。',
      '小圆刚才去闻了你的鞋。',
      '小圆守在门口,等你回家。',
      '小圆今天特别馋,它在研究一个你忘记收起来的小袋子。',
      '小圆做了一个很长的梦,梦里你一直没走。',
    ],
  },
  ownerLetter: {
    title: '主人写给它',
    paragraphs: [
      '有一天我在整理你的东西。',
      '你的饭碗被我洗了,放在橱柜里,和别的碗放在一起。你的小毯子被我叠了一下,放在阳台上晒。我拍了一张寺庙的福,那个福我还留着。',
      '然后我坐下来喝水,手自然地伸到桌边。',
      '那一下我才想起来。',
    ],
    videoUrl: '/sample/shixiaoyuan/video/xiaoyuan_veo2_sleeping.mp4',
    videoPosterUrl: '/sample/shixiaoyuan/video/xiaoyuan_veo2_sleeping-poster.png',
    videoCaption:
      '(这段动态画面是根据小圆的照片合成的。画面里的样子,和它平时的样子,并不完全一样。)',
  },
  cta: {
    title: '如果你也失去过一个',
    paragraphs: [
      '小圆的主人,在它离开之后很长一段时间,都没找到一个合适的地方来安放这些日常里的小事。',
      '相册里只有照片,没有它的脾气。',
      '朋友圈里太吵,放不下这种安静。',
      '写日记太正式,不像和它说话。',
      '这个纪念空间,就是为这些放不下的日常做的。',
    ],
    primaryLabel: '创建一个纪念空间',
    primaryHref: '/create',
    primaryNote: '默认私密 · 只有你能看 · 随时可以删除 · 你决定谁能进来',
    secondaryLabel: '先回主页看看',
    secondaryHref: '/',
  },
}

const SAMPLE_MEMORIALS: Record<string, SampleMemorial> = {
  [shixiaoyuan.slug]: shixiaoyuan,
}

export const defaultSampleMemorial = shixiaoyuan

export function getSampleMemorial(slug: string) {
  return SAMPLE_MEMORIALS[slug] || null
}

export function getAllSampleMemorialSlugs() {
  return Object.keys(SAMPLE_MEMORIALS)
}
