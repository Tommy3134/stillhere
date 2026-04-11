import Link from 'next/link'

export default function Home() {
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
                href="/create"
                className="inline-flex justify-center rounded-full bg-amber-600 px-8 py-3 text-white transition-colors hover:bg-amber-700"
              >
                登录后创建自己的纪念空间
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex justify-center rounded-full border border-stone-300 px-8 py-3 text-stone-600 transition-colors hover:bg-stone-100"
              >
                已经创建过了，直接回到我的纪念空间
              </Link>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/70 bg-stone-900 px-8 py-10 text-stone-100 shadow-sm">
            <p className="text-xs uppercase tracking-[0.32em] text-stone-400">Phase 1</p>
            <h2 className="mt-4 text-3xl font-light">这一阶段，我们先把三件事做好</h2>
            <div className="mt-8 space-y-4">
              <div className="rounded-[1.5rem] bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-stone-400">默认私密</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  真实创建时默认只有你自己能看，什么时候分享给亲友，由你自己决定。
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-stone-400">先能回来看看</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  首页、创建、我的空间、详情页和分享页先收成一条清楚主链路，不让探索功能抢解释权。
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/10 p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-stone-400">先把回忆留住</p>
                <p className="mt-2 text-sm leading-7 text-stone-200">
                  先保存照片、名字、习惯和故事，让这个空间更像你真正记得的它。
                </p>
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
              title: '先把最重要的信息留下',
              body: '不必一次写完所有东西，先留住照片、名字、习惯和故事，已经足够让这个空间开始成立。',
            },
            {
              title: '再决定什么时候分享',
              body: '分享默认关闭，只有你主动开启后，亲友才能通过链接进入这页纪念空间。',
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
