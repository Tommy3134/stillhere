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
        <p className="text-xs uppercase tracking-[0.28em] text-red-400">Danger Zone</p>
        <h2 className="mt-4 text-2xl font-light text-stone-800">确认永久删除纪念空间</h2>
        <p className="mt-4 text-sm leading-7 text-stone-500">
          删除后会移除 <span className="font-medium text-stone-700">{name}</span> 的照片引用、最近记录、纪念对话和祈福数据，而且不能恢复。
        </p>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          如果你还没导出备份，建议先下载一份 JSON 备份，再决定是否删除。
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
            {isExporting ? '导出中...' : '先导出纪念备份'}
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
              {isDeleting ? '删除中...' : '确认永久删除'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
