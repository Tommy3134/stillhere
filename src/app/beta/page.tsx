import Image from 'next/image'
import Link from 'next/link'
import { defaultSampleMemorial } from '@/lib/sample-memorial'

export const metadata = {
  title: 'StillHere 内测邀请',
  description: 'StillHere 第一阶段正在邀请少量朋友体验一个默认私密、可回来看看的宠物纪念空间。',
}

const checklist = [
  {
    title: '先创建一个纪念空间',
    body: '填名字、照片、习惯和故事。默认私密，不会自动公开。',
  },
  {
    title: '停留一下详情页',
    body: '看看这页像不像一个你愿意回来继续补充回忆的地方。',
  },
  {
    title: '如果愿意，再试分享、导出、删除',
    body: '这些能力是第一阶段最重要的信任底座，尤其值得告诉我们哪里安心、哪里不安心。',
  },
  {
    title: '最后留一条反馈',
    body: '你顺手、不顺手、会不会回来、愿不愿意分享，都会直接影响下一轮施工。',
  },
]

export default function BetaInvitePage() {
  const sampleHref = `/sample/${defaultSampleMemorial.slug}`

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-stone-100 px-6 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <section className="rounded-[2.5rem] border border-white/70 bg-white/80 px-8 py-10 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-[0.42em] text-stone-400">StillHere Beta</p>
          <h1 className="mt-4 text-4xl font-light tracking-wide text-stone-700 md:text-5xl">
            先看一个做好的样例纪念空间
            <br />
            再决定要不要登录创建
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-stone-500 md:text-lg">
            这是一个给离开的宠物留纪念空间的小网站。StillHere 第一阶段不是“数字复活”，也不是公开社交产品。
            我们现在更想先回答一件事：当你想它的时候，这样一个地方到底像不像成品、值不值得你以后回来。
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-amber-50/80 p-5">
              <h2 className="text-base font-medium text-stone-700">先看样例</h2>
              <p className="mt-2 text-sm leading-7 text-stone-500">
                这一轮不用先被登录挡住。先看看一个内容完整的样例纪念空间，确认你能不能理解它、愿不愿意继续。
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50/80 p-5">
              <h2 className="text-base font-medium text-stone-700">默认私密</h2>
              <p className="mt-2 text-sm leading-7 text-stone-500">
                真正创建自己的纪念空间时，照片、故事和重要日子默认只属于你，分享要你主动开启。
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50/80 p-5">
              <h2 className="text-base font-medium text-stone-700">先给真实反馈</h2>
              <p className="mt-2 text-sm leading-7 text-stone-500">
                现在最重要的不是夸奖，而是告诉我们哪里像、哪里不像、你会不会回来、值不值得你注册。
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={sampleHref}
              className="inline-flex justify-center rounded-full bg-amber-600 px-8 py-3 text-white transition-colors hover:bg-amber-700"
            >
              先看样例纪念空间
            </Link>
            <Link
              href="/create"
              className="inline-flex justify-center rounded-full border border-stone-300 px-8 py-3 text-stone-600 transition-colors hover:bg-stone-100"
            >
              登录后创建自己的纪念空间
            </Link>
            <Link
              href="/feedback?source=beta_invite"
              className="inline-flex justify-center rounded-full border border-dashed border-stone-300 px-8 py-3 text-stone-500 transition-colors hover:bg-stone-100"
            >
              还没开始也可以先反馈
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <div className="relative aspect-[16/10]">
              <Image
                src={defaultSampleMemorial.heroImageUrl}
                alt={`${defaultSampleMemorial.name} 的样例纪念照片`}
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.32em] text-white/70">Sample Memorial</p>
                <h2 className="mt-3 text-3xl font-light">{defaultSampleMemorial.name}</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/80">
                  {defaultSampleMemorial.hero.declarationParagraphs[0]}
                </p>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-2xl bg-amber-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">它最像它的样子</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {defaultSampleMemorial.about.facts.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-white px-3 py-1.5 text-sm text-stone-600 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-stone-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.22em] text-stone-400">最近会想起它的时候</p>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  {defaultSampleMemorial.currentMoment.statuses[0]}
                </p>
              </div>

              <Link
                href={sampleHref}
                className="inline-flex rounded-full bg-amber-600 px-6 py-3 text-sm text-white transition-colors hover:bg-amber-700"
              >
                直接打开这个样例
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.32em] text-stone-400">What To Test</p>
              <div className="mt-5 space-y-4">
                {checklist.map((item, index) => (
                  <div key={item.title} className="rounded-2xl bg-stone-50 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm text-amber-700">
                        {index + 1}
                      </span>
                      <h2 className="text-sm font-medium text-stone-700">{item.title}</h2>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-500">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Beta Notes</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-stone-500">
                <li>这是一版正在打磨中的早期产品，建议预留 5 到 10 分钟体验。</li>
                <li>如果你还不想先登录，先看样例、先反馈就已经非常有帮助。</li>
                <li>如果你正在经历很强烈的悲伤，请只在你觉得合适的时候测试。</li>
                <li>分享页和反馈都不是必须做完，但如果你愿意尝试，会非常有帮助。</li>
              </ul>
            </div>

            <div className="rounded-[2rem] bg-stone-900 px-6 py-6 text-sm leading-7 text-stone-200 shadow-sm">
              这一轮我们最想知道三件事：
              <br />
              1. 你会不会愿意回来
              <br />
              2. 这页像不像一个真正的纪念空间
              <br />
              3. 分享、导出、删除有没有让你更安心
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
