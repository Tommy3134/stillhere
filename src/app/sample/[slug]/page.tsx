import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSampleMemorial } from '@/lib/sample-memorial'

const MOOD_MAP: Record<string, string> = {
  content: '😌',
  playful: '🎾',
  sleepy: '😴',
  curious: '🔍',
}

function formatMemorialDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

type Props = {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const memorial = getSampleMemorial(params.slug)

  if (!memorial) {
    return {}
  }

  return {
    title: `${memorial.name} 的样例纪念空间 | StillHere`,
    description: memorial.summary,
    openGraph: {
      title: `${memorial.name} 的样例纪念空间 | StillHere`,
      description: memorial.summary,
      images: [{ url: memorial.photoUrls[0] }],
    },
  }
}

export default function SampleMemorialPage({ params }: Props) {
  const memorial = getSampleMemorial(params.slug)

  if (!memorial) {
    notFound()
  }

  const latestStatus = memorial.statuses[0]
  const feedbackHref = `/feedback?${new URLSearchParams({
    source: 'sample_memorial',
    spiritName: memorial.name,
    photoCount: String(memorial.photoUrls.length),
    shareEnabled: '1',
    returnReason: memorial.returnReason,
  }).toString()}`

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-stone-100 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 px-6 py-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Sample Memorial</p>
              <h1 className="mt-3 text-3xl font-light text-stone-700 md:text-4xl">
                这是一个免登录样例纪念空间
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-500 md:text-base">
                这页是为了让你先看到完成态大概是什么样，再决定 StillHere 值不值得你登录去创建自己的版本。
                真实创建时，纪念空间默认仍然是私密的。
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link
                href={feedbackHref}
                className="inline-flex justify-center rounded-full bg-amber-600 px-6 py-3 text-white transition-colors hover:bg-amber-700"
              >
                这个样例像不像成品
              </Link>
              <Link
                href="/create"
                className="inline-flex justify-center rounded-full border border-stone-300 px-6 py-3 text-stone-600 transition-colors hover:bg-stone-100"
              >
                登录后创建自己的纪念空间
              </Link>
              <Link
                href="/beta"
                className="inline-flex justify-center rounded-full border border-dashed border-stone-300 px-6 py-3 text-stone-500 transition-colors hover:bg-stone-100"
              >
                回到外测入口
              </Link>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2.5rem] bg-white/85 shadow-sm backdrop-blur">
          <div className="relative aspect-[16/9] min-h-[320px]">
            <Image
              src={memorial.photoUrls[0]}
              alt={`${memorial.name} 的纪念照片`}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-stone-900/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-xs uppercase tracking-[0.32em] text-white/70">StillHere Sample</p>
              <h2 className="mt-3 text-4xl font-light md:text-5xl">{memorial.name}</h2>
              <p className="mt-3 text-base text-white/80">家里常常叫它 {memorial.nickname}</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
                {memorial.summary}
              </p>
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-3">
            <div className="rounded-2xl bg-amber-50/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">纪念信息</p>
              <div className="mt-3 space-y-3 text-sm leading-7 text-stone-600">
                <p>生日：{formatMemorialDate(memorial.personality.birthday)}</p>
                <p>离开的日子：{formatMemorialDate(memorial.personality.passedDate)}</p>
                <p>它是：{memorial.introduction}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">它最像它的样子</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {memorial.personality.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white px-3 py-1.5 text-sm text-stone-600 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-amber-50/80 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">最近会回来看的理由</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{memorial.returnReason}</p>
              {latestStatus && (
                <p className="mt-3 text-sm leading-7 text-stone-500">
                  {MOOD_MAP[latestStatus.mood] ?? '😌'} {latestStatus.content}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">习惯和怪癖</p>
              <p className="mt-4 text-sm leading-8 text-stone-600">{memorial.personality.habits}</p>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">最让人笑的一件事</p>
              <p className="mt-4 text-sm leading-8 text-stone-600">{memorial.personality.funnyStory}</p>
            </div>

            <div className="rounded-[2rem] bg-stone-900 px-6 py-6 text-sm leading-8 text-stone-200 shadow-sm">
              “{memorial.ownerLetter}”
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-400">回忆相册</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {memorial.photoUrls.slice(1).map((photoUrl, index) => (
                <div key={photoUrl} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
                  <Image
                    src={photoUrl}
                    alt={`${memorial.name} 的回忆照片 ${index + 2}`}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 320px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-stone-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">最近纪念记录</p>
              <div className="mt-4 space-y-3">
                {memorial.statuses.map((status) => (
                  <div key={status.id} className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                    <p className="text-sm leading-7 text-stone-600">
                      {MOOD_MAP[status.mood] ?? '😌'} {status.content}
                    </p>
                    <p className="mt-2 text-xs text-stone-400">
                      {new Date(status.createdAt).toLocaleDateString('zh-CN', {
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">真实创建时的边界</p>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500">
                样例页是公开展示给你看的完成态，但真实创建时纪念空间默认私密。只有你主动开启，才会生成能发给亲友的分享页；你也可以导出和删除。
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={feedbackHref}
                className="inline-flex justify-center rounded-full bg-amber-600 px-6 py-3 text-white transition-colors hover:bg-amber-700"
              >
                告诉我们这个样例哪里像、哪里不像
              </Link>
              <Link
                href="/create"
                className="inline-flex justify-center rounded-full border border-stone-300 px-6 py-3 text-stone-600 transition-colors hover:bg-stone-100"
              >
                我也想为自己的 TA 留一个
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
