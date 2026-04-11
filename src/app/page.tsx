import Image from 'next/image'
import Link from 'next/link'
import { defaultSampleMemorial } from '@/lib/sample-memorial'

export default function Home() {
  const sampleHref = `/sample/${defaultSampleMemorial.slug}`

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-stone-100 px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2.5rem] border border-white/70 bg-white/80 px-8 py-10 shadow-sm backdrop-blur">
            <p className="text-sm uppercase tracking-[0.4em] text-stone-400">StillHere</p>
            <h1 className="mt-4 text-4xl font-light tracking-wide text-stone-700 md:text-5xl">
              给离开的 TA
              <br />
              留一个可以回来看看的地方
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-500 md:text-lg">
              一个给离开的宠物留纪念空间的小网站。默认私密，你可以放照片、名字、习惯和故事，以后想它的时候还能回来看看。
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={sampleHref}
                className="inline-flex justify-center rounded-full bg-amber-600 px-8 py-3 text-white transition-colors hover:bg-amber-700"
              >
                先看一个做好的样例纪念空间
              </Link>
              <Link
                href="/create"
                className="inline-flex justify-center rounded-full border border-stone-300 px-8 py-3 text-stone-600 transition-colors hover:bg-stone-100"
              >
                登录后创建自己的纪念空间
              </Link>
              <Link
                href="/feedback?source=homepage"
                className="inline-flex justify-center rounded-full border border-dashed border-stone-300 px-8 py-3 text-stone-500 transition-colors hover:bg-stone-100"
              >
                还没开始也可以先反馈
              </Link>
            </div>

            <Link
              href="/dashboard"
              className="mt-5 inline-flex text-sm text-stone-500 underline underline-offset-4"
            >
              已经创建过了，直接回到我的纪念空间
            </Link>
          </div>

          <div className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/80 shadow-sm backdrop-blur">
            <div className="relative aspect-[4/3]">
              <Image
                src={defaultSampleMemorial.photoUrls[0]}
                alt={`${defaultSampleMemorial.name} 的样例纪念照片`}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 44vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.32em] text-white/70">Sample Memorial</p>
                <h2 className="mt-3 text-3xl font-light">{defaultSampleMemorial.name}</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
                  {defaultSampleMemorial.summary}
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-amber-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">默认私密</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">真实创建时默认只有你自己能看，分享需要你主动开启。</p>
              </div>
              <div className="rounded-2xl bg-amber-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">先看完成态</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">先看到一个做好的样子，再决定这件事值不值得你登录去做。</p>
              </div>
              <div className="rounded-2xl bg-amber-50/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-400">安心边界</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">可控分享、可导出、可删除，不把纪念做成你无法控制的东西。</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: '先理解它是什么',
              body: '不是数字复活，不是公开社交，而是一个能安静放照片、名字、习惯和故事的纪念空间。',
            },
            {
              title: '先看到完成后的感觉',
              body: '这一轮最重要的不是让你立刻注册，而是先判断这个纪念空间到底像不像一个你愿意回来的地方。',
            },
            {
              title: '再决定值不值得创建',
              body: '看完样例、有感觉了，再去登录创建自己的版本；没感觉，也欢迎直接告诉我们哪里不对。',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[2rem] bg-white/80 p-6 shadow-sm">
              <h2 className="text-lg font-medium text-stone-700">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-stone-500">{item.body}</p>
            </div>
          ))}
        </section>

        <div className="rounded-[2rem] bg-stone-900 px-6 py-5 text-sm leading-7 text-stone-200 shadow-sm">
          这是第一阶段的纪念产品。我们先把一件事做好：当你想它的时候，真的有一个地方可以回去看看它。
        </div>
      </div>
    </main>
  )
}
