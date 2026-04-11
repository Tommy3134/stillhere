import Link from 'next/link'

export default function ShareNotFound() {
  return (
    <main className="min-h-screen bg-amber-50 px-6 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-[2rem] bg-white px-8 py-10 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl">
          🕯️
        </div>
        <h1 className="mt-6 text-2xl font-light text-stone-700">这个纪念页当前不可访问</h1>
        <p className="mt-4 text-sm leading-7 text-stone-500">
          可能是链接已经失效，或者创建者已经关闭了亲友分享。
          如果你是空间创建者，请登录后到自己的纪念空间里重新开启分享。
        </p>
        <div className="mt-8 flex w-full flex-col gap-3">
          <Link
            href="/"
            className="rounded-full bg-amber-600 px-6 py-3 text-white transition-colors hover:bg-amber-700"
          >
            回到 StillHere 首页
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-stone-300 px-6 py-3 text-stone-600 transition-colors hover:bg-stone-100"
          >
            登录后查看我的纪念空间
          </Link>
        </div>
      </div>
    </main>
  )
}
