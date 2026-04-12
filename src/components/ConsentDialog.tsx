'use client'

import Link from 'next/link'

interface ConsentDialogProps {
  onAccept: () => void
  isSubmitting: boolean
}

export function ConsentDialog({ onAccept, isSubmitting }: ConsentDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 px-6 py-8">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl">
        <div className="space-y-4 text-sm leading-7 text-stone-600">
          <p>
            StillHere 会保存你上传的照片、故事和宠物信息,用来展示你的纪念空间。登录信息由第三方服务 Privy 处理。你的数据存储在海外服务器。
          </p>
          <p>你随时可以导出或删除所有内容。</p>
          <p>
            <Link
              href="/privacy"
              className="text-stone-700 underline underline-offset-4 hover:text-stone-900"
            >
              查看完整隐私政策
            </Link>
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={onAccept}
            disabled={isSubmitting}
            className="w-full rounded-full bg-stone-900 px-6 py-3 text-sm text-stone-50 transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '处理中...' : '我知道了,继续'}
          </button>
        </div>
      </div>
    </div>
  )
}
