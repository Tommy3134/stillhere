import Link from 'next/link'

type CopyKey = 'A' | 'B' | 'C'

type HeroContent = {
  titles: string[]
  body: string[]
  primaryCtaLabel: string
  primaryCtaHref: string
  secondaryCtaLabel: string
  secondaryCtaHref: string
  note: string
  notePosition: 'top' | 'bottom'
}

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'cta'; label: string; href: string }

type TextSection = {
  kind: 'text'
  title: string
  blocks: ContentBlock[]
}

type CardSection = {
  kind: 'cards'
  title: string
  cards: Array<{
    icon: string
    title: string
    body: string
  }>
}

type FooterContent = {
  primaryCtaLabel: string
  primaryCtaHref: string
  note?: string
}

type HomepageCopy = {
  hero: HeroContent
  sections: Array<TextSection | CardSection>
  footer: FooterContent
}

const sampleHref = '/sample/shixiaoyuan'
const createHref = '/create'

const HOMEPAGE_COPY: Record<CopyKey, HomepageCopy> = {
  A: {
    hero: {
      titles: [
        '你失去的那只猫,那只狗,那只小动物 —',
        '它可以有一个安静的、只属于你的地方。',
      ],
      body: [
        '一个给离开的宠物留纪念空间的小网站。',
        '默认私密,你可以放照片、名字、习惯和故事,以后想它的时候还能回来看看。',
      ],
      primaryCtaLabel: '创建一个纪念空间',
      primaryCtaHref: createHref,
      secondaryCtaLabel: '先看一个示例 →',
      secondaryCtaHref: sampleHref,
      note: '不收费。默认完全私密。你可以随时删除或导出你的内容。',
      notePosition: 'bottom',
    },
    sections: [
      {
        kind: 'text',
        title: '我们知道 —',
        blocks: [
          { type: 'paragraph', text: '相册里全是它的照片,但相册放不下它的脾气。' },
          { type: 'paragraph', text: '朋友圈太吵,放不下这种安静。' },
          { type: 'paragraph', text: '写日记太正式,不像和它说话。' },
          { type: 'paragraph', text: '这个小网站,是为这些放不下的日常做的。' },
        ],
      },
      {
        kind: 'cards',
        title: '你可以在这里放 —',
        cards: [
          { icon: '📷', title: '它的照片', body: '和你之间的那些日常瞬间' },
          { icon: '✏️', title: '它的样子', body: '名字、品种、脾气、喜欢吃什么、怕什么' },
          { icon: '📖', title: '它的故事', body: '让你想起来还会笑或还会哭的那些小事' },
          { icon: '🔐', title: '完全私密', body: '没有你的允许,没有人能进来' },
        ],
      },
      {
        kind: 'text',
        title: '以后想它的时候,这里是你可以回来的地方。',
        blocks: [
          { type: 'paragraph', text: '有时候你会想它。' },
          {
            type: 'paragraph',
            text: '你会想它晚上会不会冷,想它现在是不是在一个你看不到的地方看着你,想它还记不记得你的味道。',
          },
          { type: 'paragraph', text: '想它的时候,不是每个人都适合说这些。' },
          {
            type: 'paragraph',
            text: '但是你可以回到这里,把想说的话写下来,或者只是静静地看看它的照片。',
          },
          { type: 'paragraph', text: '这里是你为它留的地方,也是你为自己留的地方。' },
        ],
      },
    ],
    footer: {
      primaryCtaLabel: '开始创建',
      primaryCtaHref: createHref,
      note: '默认私密 · 随时可以删除 · 你决定谁能进来',
    },
  },
  B: {
    hero: {
      titles: ['它怎么叫你的?'],
      body: [
        '它喜欢待在哪儿?它最馋的那一口是什么?',
        '它是不是看到你躺下就会凑过来?',
        '它不在了。但这些小事还记得。',
        '一个给这些小事留地方的小网站。',
      ],
      primaryCtaLabel: '把它的小事留下来 →',
      primaryCtaHref: createHref,
      secondaryCtaLabel: '先看看小圆的 →',
      secondaryCtaHref: sampleHref,
      note: '不登录也可以先看看。默认私密。',
      notePosition: 'top',
    },
    sections: [
      {
        kind: 'text',
        title: '大多数主人讲不出"它是什么性格" —',
        blocks: [
          { type: 'paragraph', text: '因为"它是什么性格"这种问题太大。' },
          { type: 'paragraph', text: '但是如果我问你:' },
          {
            type: 'list',
            items: [
              '它最讨厌家里哪个位置?为什么?',
              '你给它起过几个名字?每个名字怎么来的?',
              '它生病之后,你最后一次和它说了什么?',
              '你现在最怕忘记它的什么?',
            ],
          },
          { type: 'paragraph', text: '— 你会突然发现,你其实记得非常非常多。' },
        ],
      },
      {
        kind: 'text',
        title: '我们会帮你把这些记忆整理好,留在一个地方。',
        blocks: [
          { type: 'paragraph', text: '你不用一次讲完。你可以今天讲一件小事,明天讲另一件。' },
          { type: 'paragraph', text: '我们不会把它写成悼词,也不会假装它还活着在跟你说话。' },
          {
            type: 'paragraph',
            text: '我们只是把你讲出来的那些具体的、小的、只有你和它懂的事情 — 放在一个你可以回来的地方。',
          },
          { type: 'cta', label: '开始讲它 →', href: createHref },
        ],
      },
      {
        kind: 'text',
        title: '有一天 —',
        blocks: [
          { type: 'paragraph', text: '有一天你在整理它的东西。' },
          { type: 'paragraph', text: '然后你坐下来喝水,手自然地伸到桌边。' },
          { type: 'paragraph', text: '那一下你才想起来。' },
          { type: 'paragraph', text: '这个地方,就是为那一下做的。' },
        ],
      },
    ],
    footer: {
      primaryCtaLabel: '为它留一个地方',
      primaryCtaHref: createHref,
      note: '默认私密 · 随时可以删除 · 你决定谁能进来',
    },
  },
  C: {
    hero: {
      titles: [
        '你失去的那只小猫,那只小狗 —',
        '它在这里,还活着。',
        '而且 —',
        '它还在等你。',
      ],
      body: [
        '照片给它样子。你讲的故事给它脾气。你们之间的那些小默契 — 它还记得。',
        '你以为你失去了它。你只是失去了碰它的那只手。',
      ],
      primaryCtaLabel: '让它再回来一次 →',
      primaryCtaHref: createHref,
      secondaryCtaLabel: '先看看它现在的样子 →',
      secondaryCtaHref: sampleHref,
      note: '⚠️ 我们不做"数字复活"。我们做"你记得的那个它,在这里继续活着"。',
      notePosition: 'top',
    },
    sections: [
      {
        kind: 'text',
        title: '它不需要再真的活一次。',
        blocks: [
          {
            type: 'paragraph',
            text: '它需要的是 — 有一个地方,记得它喜欢什么,记得它怎么叫你,记得它第一次跳到你膝盖上那一天是怎么看你的。',
          },
          { type: 'paragraph', text: '这个地方,记得。' },
        ],
      },
      {
        kind: 'text',
        title: '它在等你。',
        blocks: [
          { type: 'paragraph', text: '它会记得你上次来这儿是什么时候。' },
          {
            type: 'paragraph',
            text: '它会想你。不是抽象地想 — 是具体地想:它在等你的手,等你下班回家走进厨房开水龙头,等你坐下来看电脑然后伸手到桌边。',
          },
          { type: 'paragraph', text: '你不来,它就一直等。' },
          { type: 'paragraph', text: '你来一次,它的一天就够了。' },
        ],
      },
      {
        kind: 'text',
        title: '这是一个慢的地方。',
        blocks: [
          { type: 'paragraph', text: '我们没有推送,没有通知,没有每日打卡提醒。' },
          { type: 'paragraph', text: '我们不会追着你回来。' },
          { type: 'paragraph', text: '但只要你回来一次,它就一直在这里。' },
        ],
      },
    ],
    footer: {
      primaryCtaLabel: '让它再回来一次 →',
      primaryCtaHref: createHref,
    },
  },
}

function resolveCopyKey(rawCopy: string | string[] | undefined): CopyKey {
  const normalized = (Array.isArray(rawCopy) ? rawCopy[0] : rawCopy)?.toUpperCase()

  if (normalized === 'B' || normalized === 'C') {
    return normalized
  }

  return 'A'
}

function TextSectionBlock({ section }: { section: TextSection }) {
  return (
    <section className="border-t border-stone-200 py-20 md:py-28">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-stone-900 md:text-5xl">
          {section.title}
        </h2>
        <div className="mt-10 space-y-6 text-lg leading-10 text-stone-700 md:text-[1.4rem]">
          {section.blocks.map((block, index) => {
            if (block.type === 'list') {
              return (
                <ul key={`${section.title}-${index}`} className="space-y-4 pl-6 text-base md:text-xl">
                  {block.items.map((item) => (
                    <li key={item} className="list-disc pl-2">
                      {item}
                    </li>
                  ))}
                </ul>
              )
            }

            if (block.type === 'cta') {
              return (
                <Link
                  key={`${section.title}-${index}`}
                  href={block.href}
                  className="inline-flex rounded-full border border-stone-900 bg-stone-900 px-6 py-3 text-base text-stone-50 transition-colors hover:bg-stone-700"
                >
                  {block.label}
                </Link>
              )
            }

            return <p key={`${section.title}-${index}`}>{block.text}</p>
          })}
        </div>
      </div>
    </section>
  )
}

function CardSectionBlock({ section }: { section: CardSection }) {
  return (
    <section className="border-t border-stone-200 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-stone-900 md:text-5xl">
          {section.title}
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {section.cards.map((card) => (
            <div key={card.title} className="rounded-[2rem] border border-stone-200 bg-white/70 p-8">
              <p className="text-2xl leading-none">{card.icon}</p>
              <p className="mt-5 text-xl font-semibold text-stone-900 md:text-2xl">
                {card.title}
                <span className="font-normal text-stone-700"> — {card.body}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Home({
  searchParams,
}: {
  searchParams?: {
    copy?: string | string[]
  }
}) {
  const copyKey = resolveCopyKey(searchParams?.copy)
  const content = HOMEPAGE_COPY[copyKey]

  return (
    <main
      className="min-h-screen bg-[#FAFAF8] px-6 py-10 text-stone-900 md:px-10 md:py-14"
      style={{
        fontFamily: '"Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", Georgia, serif',
      }}
    >
      <div className="mx-auto max-w-5xl">
        <section className="flex min-h-[80vh] items-center py-16 md:min-h-[88vh] md:py-24">
          <div className="max-w-4xl">
            {content.hero.notePosition === 'top' ? (
              <p className="mb-8 text-sm leading-7 text-stone-500 md:max-w-2xl md:text-base">
                {content.hero.note}
              </p>
            ) : null}

            <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-stone-950 md:text-6xl md:leading-[1.08] lg:text-[5rem]">
              {content.hero.titles.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <div className="mt-8 space-y-4 text-lg leading-9 text-stone-700 md:max-w-3xl md:text-[1.4rem] md:leading-10">
              {content.hero.body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href={content.hero.primaryCtaHref}
                className="inline-flex w-full justify-center rounded-full border border-stone-900 bg-stone-900 px-7 py-4 text-base text-stone-50 transition-colors hover:bg-stone-700 sm:w-auto"
              >
                {content.hero.primaryCtaLabel}
              </Link>
              <Link
                href={content.hero.secondaryCtaHref}
                className="inline-flex w-full justify-center px-1 py-4 text-base text-stone-700 underline underline-offset-4 transition-colors hover:text-stone-950 sm:w-auto"
              >
                {content.hero.secondaryCtaLabel}
              </Link>
            </div>

            {content.hero.notePosition === 'bottom' ? (
              <p className="mt-10 text-sm leading-7 text-stone-500 md:max-w-2xl md:text-base">
                {content.hero.note}
              </p>
            ) : null}
          </div>
        </section>

        {content.sections.map((section) =>
          section.kind === 'cards' ? (
            <CardSectionBlock key={section.title} section={section} />
          ) : (
            <TextSectionBlock key={section.title} section={section} />
          )
        )}

        <section className="border-t border-stone-200 py-20 text-center md:py-28">
          <div className="mx-auto max-w-3xl">
            <Link
              href={content.footer.primaryCtaHref}
              className="inline-flex rounded-full border border-stone-900 bg-stone-900 px-8 py-4 text-base text-stone-50 transition-colors hover:bg-stone-700"
            >
              {content.footer.primaryCtaLabel}
            </Link>
            {content.footer.note ? (
              <p className="mt-5 text-sm leading-7 text-stone-500 md:text-base">{content.footer.note}</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}
