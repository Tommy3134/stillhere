'use client'

export function AuthLoadingState({
  title = '正在连接登录服务',
  body = '如果这里停留超过几秒，通常是本地登录配置还没准备好，比如 Privy 对 localhost 的允许域名还没配齐。',
}: {
  title?: string
  body?: string
}) {
  return (
    <main className="min-h-screen bg-amber-50 px-6 py-12">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
        <h1 className="mt-6 text-2xl font-light text-stone-700">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-stone-500">{body}</p>
      </div>
    </main>
  )
}
