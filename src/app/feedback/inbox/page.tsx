'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'

import { AuthLoadingState } from '@/components/AuthLoadingState'
import { LoginButton } from '@/components/LoginButton'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import { readResponsePayload } from '@/lib/read-response-payload'

interface FeedbackSubmission {
  id: string
  userId: string | null
  source: string
  sourceLabel: string
  spiritId: string | null
  spiritName: string | null
  contextSnapshot?: {
    progressLabel?: string | null
    nextStep?: string | null
    photoCount?: number | null
    shareEnabled?: boolean | null
    returnReason?: string | null
  } | null
  who: string | null
  feeling: string | null
  comeback: string | null
  feature: string | null
  wanted: string | null
  price: string | null
  share: string | null
  other: string | null
  createdAt: string
}

interface FeedbackSummary {
  total: number
  bySource: Array<{
    source: string
    sourceLabel: string
    count: number
  }>
}

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

function AnswerRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null
  }

  return (
    <div className="rounded-2xl bg-stone-50 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-2 text-sm leading-7 text-stone-600 whitespace-pre-wrap">{value}</p>
    </div>
  )
}

function SnapshotRow({ snapshot }: { snapshot?: FeedbackSubmission['contextSnapshot'] }) {
  if (!snapshot) {
    return null
  }

  const chips = [
    snapshot.progressLabel ? `纪念进展 ${snapshot.progressLabel}` : null,
    typeof snapshot.photoCount === 'number' ? `照片 ${snapshot.photoCount} 张` : null,
    snapshot.shareEnabled === true ? '已开启亲友分享' : null,
    snapshot.shareEnabled === false ? '仍保持私密' : null,
    snapshot.returnReason ? `回访理由：${snapshot.returnReason}` : null,
  ].filter((item): item is string => Boolean(item))

  if (chips.length === 0 && !snapshot.nextStep) {
    return null
  }

  return (
    <div className="rounded-2xl bg-amber-50 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-amber-700">反馈发生时的页面状态</p>
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-white px-3 py-1 text-xs text-stone-600">
              {chip}
            </span>
          ))}
        </div>
      )}
      {snapshot.nextStep && (
        <p className="mt-3 text-sm leading-7 text-stone-600">
          当时系统建议的下一步：{snapshot.nextStep}
        </p>
      )}
    </div>
  )
}

export default function FeedbackInboxPage() {
  const { ready, authenticated } = usePrivy()
  const authFetch = useAuthFetch()
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([])
  const [summary, setSummary] = useState<FeedbackSummary>({ total: 0, bySource: [] })
  const [storage, setStorage] = useState('')
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')

  useEffect(() => {
    setPageError('')
    setLoading(true)

    if (!ready) return

    if (!authenticated) {
      setLoading(false)
      return
    }

    authFetch('/api/feedback?limit=100')
      .then(async (res) => {
        const data = await readResponsePayload(res)

        if (!res.ok) {
          throw new Error((data as { error?: string }).error || '反馈收件箱暂时不可用')
        }

        setSubmissions((data as { submissions?: FeedbackSubmission[] }).submissions || [])
        setSummary((data as { summary?: FeedbackSummary }).summary || { total: 0, bySource: [] })
        setStorage((data as { storage?: string }).storage || '')
      })
      .catch((error) => {
        console.error(error)
        setSubmissions([])
        setSummary({ total: 0, bySource: [] })
        setPageError(error instanceof Error ? error.message : '反馈收件箱暂时不可用')
      })
      .finally(() => setLoading(false))
  }, [ready, authenticated, authFetch])

  const filteredSubmissions = useMemo(() => {
    if (sourceFilter === 'all') {
      return submissions
    }

    return submissions.filter((item) => item.source === sourceFilter)
  }, [sourceFilter, submissions])

  const willingToReturnCount = useMemo(() => {
    return filteredSubmissions.filter((item) => item.comeback === 'often' || item.comeback === 'occasionally').length
  }, [filteredSubmissions])

  const willingToShareCount = useMemo(() => {
    return filteredSubmissions.filter((item) => item.share === 'yes' || item.share === 'maybe').length
  }, [filteredSubmissions])

  if (!ready) {
    return (
      <AuthLoadingState
        title="正在准备反馈收件箱"
        body="我们正在确认登录状态和查看权限。开发环境默认允许已登录成员查看，线上环境会额外检查 allowlist。"
      />
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-amber-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-light text-stone-700">登录后查看反馈收件箱</h1>
          <p className="mt-4 text-sm leading-7 text-stone-500">
            这里是内部查看入口。本地开发默认允许已登录成员访问；线上环境需要在环境变量里配置反馈查看 allowlist。
          </p>
          <div className="mt-8">
            <LoginButton
              label="登录并查看"
              className="inline-flex rounded-full bg-amber-600 px-8 py-3 text-white transition-colors hover:bg-amber-700"
            />
          </div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-stone-400">正在加载反馈...</p>
      </main>
    )
  }

  if (pageError) {
    return (
      <main className="min-h-screen bg-amber-50 px-6 py-12">
        <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-light text-stone-700">反馈收件箱暂时不可用</h1>
          <p className="mt-4 text-sm leading-7 text-red-500">{pageError}</p>
          <p className="mt-4 text-sm leading-7 text-stone-500">
            如果你在预览或线上环境看到 `Forbidden`，通常是还没有配置
            `FEEDBACK_REVIEWER_EMAILS` 或 `FEEDBACK_REVIEWER_PRIVY_IDS`。
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex rounded-full border border-stone-300 px-6 py-3 text-stone-600 transition-colors hover:bg-stone-100"
            >
              回到我的纪念空间
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] bg-white p-6 shadow-sm md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">Internal</p>
            <h1 className="mt-3 text-3xl font-light text-stone-700">反馈收件箱</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500">
              这里聚合最近 100 条反馈，优先帮助我们判断第一阶段主链哪里顺、哪里卡、哪些探索线该收、哪些该继续。
            </p>
            <p className="mt-2 text-xs text-stone-400">
              当前读取来源：{storage || 'unknown'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/feedback"
              className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-100"
            >
              打开反馈表单
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-amber-600 px-5 py-3 text-sm text-white transition-colors hover:bg-amber-700"
            >
              回到我的纪念空间
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">当前样本</p>
            <p className="mt-3 text-3xl font-light text-stone-700">{filteredSubmissions.length}</p>
            <p className="mt-2 text-sm text-stone-500">当前筛选条件下的反馈条数</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">愿意回来</p>
            <p className="mt-3 text-3xl font-light text-stone-700">{willingToReturnCount}</p>
            <p className="mt-2 text-sm text-stone-500">选择“会”或“偶尔会”回来的反馈数</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-400">愿意分享</p>
            <p className="mt-3 text-3xl font-light text-stone-700">{willingToShareCount}</p>
            <p className="mt-2 text-sm text-stone-500">选择“会”或“也许会”分享的反馈数</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSourceFilter('all')}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                sourceFilter === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              全部 ({summary.total})
            </button>
            {summary.bySource.map((item) => (
              <button
                key={item.source}
                type="button"
                onClick={() => setSourceFilter(item.source)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  sourceFilter === item.source
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {item.sourceLabel} ({item.count})
              </button>
            ))}
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="rounded-[2rem] bg-white px-8 py-10 text-center shadow-sm">
            <h2 className="text-2xl font-light text-stone-700">还没有反馈</h2>
            <p className="mt-4 text-sm leading-7 text-stone-500">
              当前筛选条件下还没有收进来可读反馈。可以先从首页、dashboard 或纪念空间详情页提交一条测试反馈。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((item) => (
              <article key={item.id} className="rounded-[2rem] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">
                        {item.sourceLabel}
                      </span>
                      {item.spiritName && (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                          {item.spiritName}
                        </span>
                      )}
                      {item.who && (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                          对象：{item.who}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-stone-400">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-stone-500 md:text-right">
                    {item.comeback && <p>回来意愿：{item.comeback}</p>}
                    {item.share && <p>分享意愿：{item.share}</p>}
                    {item.feature && <p>当前亮点：{item.feature}</p>}
                    {item.wanted && <p>下一步最想补：{item.wanted}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <SnapshotRow snapshot={item.contextSnapshot} />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <AnswerRow label="真实感受" value={item.feeling} />
                  <AnswerRow label="补的一件事" value={item.wanted} />
                  <AnswerRow label="付费偏好" value={item.price} />
                  <AnswerRow label="还想补充" value={item.other} />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
