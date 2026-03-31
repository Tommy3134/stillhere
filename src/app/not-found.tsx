export default function NotFound() {
  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🌙</p>
        <h1 className="text-xl text-stone-600 mb-2">页面不存在</h1>
        <a href="/" className="text-amber-600 hover:underline text-sm">回到首页</a>
      </div>
    </main>
  )
}
