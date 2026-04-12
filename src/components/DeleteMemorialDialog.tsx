'use client'

interface DeleteMemorialDialogProps {
  name: string
  confirmValue: string
  isDeleting: boolean
  isExporting: boolean
  notice?: string
  error?: string
  onConfirmValueChange: (value: string) => void
  onCancel: () => void
  onExport: () => void
  onConfirmDelete: () => void
}

export function DeleteMemorialDialog({
  name,
  confirmValue,
  isDeleting,
  isExporting,
  notice,
  error,
  onConfirmValueChange,
  onCancel,
  onExport,
  onConfirmDelete,
}: DeleteMemorialDialogProps) {
  const matchesName = confirmValue.trim() === name.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 px-6 py-8">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-xl">
        <h2 className="text-2xl font-light leading-9 text-stone-800">
          确认删除 <span className="font-medium text-stone-900">{name}</span> 的纪念空间?
        </h2>
        <p className="mt-4 text-sm leading-7 text-stone-500">
          删除后,以下内容会从我们的服务器上<span className="font-medium text-stone-700">永久清除</span>:
        </p>
        <ul className="mt-3 space-y-2 rounded-2xl bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-500">
          <li>- 所有照片和视频</li>
          <li>- 所有故事和文字记录</li>
          <li>- 所有分享链接(立刻失效)</li>
          <li>- 所有访问和创建记录</li>
        </ul>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          你<span className="font-medium text-stone-700">无法恢复</span>删除的内容。这个操作不可回退。
        </p>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          如果你只是暂时不想看到它,可以<span className="font-medium text-stone-700">先导出一份备份</span>再删除 — 这样你手上会有一份完整的文件,随时可以自己保存或以后重新上传。
        </p>

        <div className="mt-5 rounded-2xl bg-stone-50 px-4 py-4">
          <label className="block text-xs text-stone-500">
            输入 <span className="font-medium text-stone-700">{name}</span> 确认删除
          </label>
          <input
            type="text"
            value={confirmValue}
            onChange={(event) => onConfirmValueChange(event.target.value)}
            placeholder={name}
            className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-red-300 focus:outline-none"
          />
        </div>

        {notice && (
          <p className="mt-4 text-sm leading-6 text-emerald-600">{notice}</p>
        )}
        {error && (
          <p className="mt-4 text-sm leading-6 text-red-500">{error}</p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onExport}
            disabled={isExporting}
            className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? '导出中...' : '先导出备份再决定'}
          </button>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              取消
            </button>
            <button
              onClick={onConfirmDelete}
              disabled={!matchesName || isDeleting}
              className="flex-1 rounded-full bg-red-600 px-5 py-3 text-sm text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? '删除中...' : '永久删除'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
