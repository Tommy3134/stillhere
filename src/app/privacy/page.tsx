import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '隐私政策 · StillHere',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PrivacyPage() {
  return (
    <main
      className="min-h-screen bg-[#FAFAF8] px-6 py-16 text-stone-900 md:px-10 md:py-24"
      style={{
        fontFamily: '"Songti SC", "STSong", "Noto Serif SC", "Source Han Serif SC", Georgia, serif',
      }}
    >
      <div className="mx-auto max-w-2xl space-y-10">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] text-stone-900 md:text-4xl">
          StillHere 隐私政策
        </h1>

        <p className="text-lg leading-9 text-stone-700">
          StillHere 是一个给离开的宠物留纪念空间的地方。下面是我们怎么对待你的数据。
        </p>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-800">我们收集什么</h2>
          <ul className="list-disc space-y-2 pl-6 text-stone-700 leading-8">
            <li>你的登录信息(邮箱,通过第三方服务 Privy 处理)</li>
            <li>你上传的照片、视频、故事和宠物信息</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-800">用来做什么</h2>
          <ul className="list-disc space-y-2 pl-6 text-stone-700 leading-8">
            <li>渲染你的纪念空间。除此之外,不做任何事。</li>
            <li>不用你的内容训练 AI,不卖给任何人,不分享给第三方。</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-800">存在哪里</h2>
          <p className="text-stone-700 leading-8">
            你的数据存储在海外服务器(Vercel + Supabase)。使用本服务即表示你知晓并同意这一点。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-800">你可以做的</h2>
          <ul className="list-disc space-y-2 pl-6 text-stone-700 leading-8">
            <li>随时导出:把你的照片、故事和所有内容打包下载,格式是你能直接打开的。</li>
            <li>随时删除:删除后数据会被彻底清除,不可恢复。</li>
            <li>删除账号后,你提交的产品反馈将被匿名保留用于产品改进。</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-800">第三方服务</h2>
          <p className="text-stone-700 leading-8">
            登录功能由 Privy 提供,你的登录信息可能存储在 Privy 的服务器上。
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-800">联系我们</h2>
          <p className="text-stone-700 leading-8">
            有任何问题:<a href="mailto:jiandalawyer@gmail.com" className="underline underline-offset-4 hover:text-stone-900">jiandalawyer@gmail.com</a>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-stone-800">更新</h2>
          <p className="text-stone-700 leading-8">
            本政策可能会调整,调整后会在此页面更新。
          </p>
        </section>

        <p className="text-sm text-stone-400">最后更新:2026 年 4 月</p>

        <div className="pt-4">
          <Link href="/" className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-700">
            ← 返回首页
          </Link>
        </div>
      </div>
    </main>
  )
}
