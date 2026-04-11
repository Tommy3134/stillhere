'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { usePrivy } from '@privy-io/react-auth'
import PixelPetEngine from '@/components/PixelPetEngine'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import { LoginButton } from '@/components/LoginButton'
import { AuthLoadingState } from '@/components/AuthLoadingState'
import { DeleteMemorialDialog } from '@/components/DeleteMemorialDialog'
import { EditMemorialDialog } from '@/components/EditMemorialDialog'
import { FeedbackPromptCard } from '@/components/FeedbackPromptCard'
import { getMemorialInsight } from '@/lib/memorial-insights'
import { getMemorialRoadmap, getMemorialTimeline } from '@/lib/memorial-roadmap'
import { readResponsePayload } from '@/lib/read-response-payload'

const MOOD_CONFIG: Record<string, { emoji: string; bg: string; label: string }> = {
  sleepy: { emoji: '💤', bg: 'bg-blue-100', label: '犯困' },
  playful: { emoji: '🎮', bg: 'bg-yellow-100', label: '玩耍' },
  content: { emoji: '😊', bg: 'bg-green-100', label: '满足' },
  curious: { emoji: '🔍', bg: 'bg-purple-100', label: '好奇' },
  happy: { emoji: '✨', bg: 'bg-amber-100', label: '开心' },
}

interface SpiritStatus {
  id: string
  content: string
  mood: string
  createdAt: string
}

interface Spirit {
  id: string
  name: string
  spiritType: string
  createdAt: string
  updatedAt: string
  personality: {
    nickname?: string
    tags: string[]
    habits?: string
    funnyStory?: string
    birthday?: string
    passedDate?: string
    decor?: string[]
  }
  homeStyle: string
  shareEnabled: boolean
  photoRefs?: string[]
  photoUrls: string[]
  statuses: SpiritStatus[]
}

const MAX_TOTAL_PHOTOS = 18

function formatMemorialDate(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export default function SpiritPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { ready, authenticated } = usePrivy()
  const authFetch = useAuthFetch()
  const [spirit, setSpirit] = useState<Spirit | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [viewPhoto, setViewPhoto] = useState<string | null>(null)
  const [updatingShare, setUpdatingShare] = useState(false)
  const [shareNotice, setShareNotice] = useState('')
  const [shareError, setShareError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dataNotice, setDataNotice] = useState('')
  const [dataError, setDataError] = useState('')
  const [memoryNotice, setMemoryNotice] = useState('')
  const [memoryError, setMemoryError] = useState('')
  const [isSavingMemorial, setIsSavingMemorial] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmValue, setDeleteConfirmValue] = useState('')

  useEffect(() => {
    setPageError('')
    setLoading(true)

    if (!ready) return

    if (!authenticated) {
      setLoading(false)
      return
    }

    authFetch(`/api/spirit?id=${params.id}`)
      .then(async (res) => {
        const data = await readResponsePayload(res)

        if (!res.ok || !(data as { spirit?: Spirit }).spirit) {
          throw new Error((data as { error?: string }).error || '找不到这个纪念空间')
        }

        setSpirit((data as { spirit: Spirit }).spirit)
      })
      .catch((error) => {
        console.error(error)
        setSpirit(null)
        setPageError(error instanceof Error ? error.message : '纪念空间暂时不可用')
      })
      .finally(() => setLoading(false))
  }, [ready, authenticated, authFetch, params.id])

  if (!ready) {
    return (
      <AuthLoadingState
        title="正在准备纪念空间"
        body="详情页需要先确认登录状态和访问权限。要是这里停留太久，通常是登录服务还没完全就绪。"
      />
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-stone-400">加载中...</p>
      </main>
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-amber-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-light text-stone-700">登录后查看纪念空间</h1>
          <p className="mt-4 text-sm leading-7 text-stone-500">
            这里默认只对创建者开放。登录后，你可以继续补充回忆、查看照片和决定是否分享给亲友。
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

  if (!spirit) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center">
        <p className="text-stone-400">{pageError || '找不到这个纪念空间，或你暂时没有查看权限。'}</p>
      </main>
    )
  }

  const latestStatus = spirit.statuses[0]
  const mood = latestStatus?.mood || 'content'
  const statusText = latestStatus?.content || '这里安静地保存着和它有关的回忆'
  const moodInfo = MOOD_CONFIG[mood] || MOOD_CONFIG.content
  const memorialFacts = [
    spirit.personality.nickname ? { label: '家人常叫它', value: spirit.personality.nickname } : null,
    spirit.personality.birthday ? { label: '生日', value: formatMemorialDate(spirit.personality.birthday) } : null,
    spirit.personality.passedDate ? { label: '离开的日子', value: formatMemorialDate(spirit.personality.passedDate) } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item))
  const personalityNotes = [
    spirit.personality.habits ? { label: '习惯和怪癖', value: spirit.personality.habits } : null,
    spirit.personality.funnyStory ? { label: '最让人笑的一件事', value: spirit.personality.funnyStory } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item))
  const memorialInsight = getMemorialInsight(spirit)
  const memorialRoadmap = getMemorialRoadmap(spirit)
  const memorialTimeline = getMemorialTimeline(spirit)
  const nextRoadmapItem = memorialRoadmap.items.find((item) => item.state === 'next')
  const feedbackHref = `/feedback?${new URLSearchParams({
    source: 'spirit_detail',
    spiritId: spirit.id,
    spiritName: spirit.name,
    progress: `${memorialRoadmap.doneCount}/${memorialRoadmap.totalCount}`,
    nextStep: nextRoadmapItem?.title || '',
    photoCount: String(spirit.photoUrls.length),
    shareEnabled: spirit.shareEnabled ? '1' : '0',
    returnReason: memorialInsight.shortLabel,
  }).toString()}`
  const insightToneClass = memorialInsight.category === 'today'
    ? 'bg-amber-100 text-amber-900'
    : memorialInsight.category === 'upcoming'
      ? 'bg-orange-100 text-orange-900'
      : memorialInsight.category === 'memory'
        ? 'bg-stone-100 text-stone-800'
        : 'bg-emerald-50 text-emerald-900'

  const toggleShare = async (shareEnabled: boolean) => {
    if (updatingShare) return

    setUpdatingShare(true)
    setShareError('')
    setShareNotice('')

    try {
      const res = await authFetch('/api/spirit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: spirit.id, shareEnabled }),
      })
      const data = await readResponsePayload(res)

      if (!res.ok) {
        throw new Error((data as { error?: string }).error || '更新分享设置失败')
      }

      setSpirit((current) => current ? {
        ...current,
        shareEnabled: (data as { spirit: { shareEnabled: boolean } }).spirit.shareEnabled,
      } : current)
      setShareNotice(
        shareEnabled
          ? '纪念页已经开启，你可以把链接发给亲友。'
          : '纪念页已经关闭，外部访问会被拦住。'
      )
    } catch (error) {
      setShareError(error instanceof Error ? error.message : '更新分享设置失败')
    } finally {
      setUpdatingShare(false)
    }
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/share/${spirit.id}`)
      setShareNotice('纪念页链接已复制。')
      setShareError('')
    } catch {
      setShareError('复制链接失败，请稍后再试')
    }
  }

  const exportMemorial = async () => {
    if (isExporting) return

    setIsExporting(true)
    setDataError('')
    setDataNotice('')

    try {
      const res = await authFetch(`/api/spirit/export?id=${spirit.id}`)
      if (!res.ok) {
        const data = await readResponsePayload(res)
        throw new Error((data as { error?: string }).error || '导出失败')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${spirit.name}-memorial-export.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      setDataNotice('纪念备份已开始下载。')
    } catch (error) {
      setDataError(error instanceof Error ? error.message : '导出失败')
    } finally {
      setIsExporting(false)
    }
  }

  const deleteMemorial = async () => {
    if (isDeleting) return
    if (deleteConfirmValue.trim() !== spirit.name.trim()) {
      setDataError('请输入纪念空间名字后再确认删除。')
      return
    }

    setIsDeleting(true)
    setDataError('')
    setDataNotice('')

    try {
      const res = await authFetch(`/api/spirit?id=${spirit.id}`, {
        method: 'DELETE',
      })
      const data = await readResponsePayload(res)

      if (!res.ok) {
        throw new Error((data as { error?: string }).error || '删除失败')
      }

      setShowDeleteDialog(false)
      setDeleteConfirmValue('')
      router.replace(`/dashboard?deleted=1&name=${encodeURIComponent(spirit.name)}`)
    } catch (error) {
      setDataError(error instanceof Error ? error.message : '删除失败')
      setIsDeleting(false)
    }
  }

  const saveMemorial = async (payload: {
    name: string
    personality: Spirit['personality']
    newPhotos: File[]
    removePhotoRefs: string[]
  }) => {
    if (isSavingMemorial) return

    setIsSavingMemorial(true)
    setMemoryError('')
    setMemoryNotice('')

    try {
      let addPhotoUrls: string[] = []

      if (payload.newPhotos.length > 0) {
        const formData = new FormData()
        payload.newPhotos.forEach((file) => formData.append('photos', file))

        const uploadRes = await authFetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await readResponsePayload(uploadRes)

        if (!uploadRes.ok) {
          throw new Error((uploadData as { error?: string }).error || '照片上传失败')
        }

        addPhotoUrls = (uploadData as { paths?: string[] }).paths || []
        if (addPhotoUrls.length !== payload.newPhotos.length) {
          throw new Error('有部分照片上传失败，请稍后再试')
        }
      }

      const res = await authFetch('/api/spirit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: spirit.id,
          name: payload.name,
          personality: payload.personality,
          addPhotoUrls,
          removePhotoRefs: payload.removePhotoRefs,
        }),
      })
      const data = await readResponsePayload(res)

      if (!res.ok || !(data as { spirit?: Spirit }).spirit) {
        throw new Error((data as { error?: string }).error || '保存回忆失败')
      }

      setSpirit((data as { spirit: Spirit }).spirit)
      setShowEditDialog(false)
      setMemoryNotice(
        addPhotoUrls.length > 0 && payload.removePhotoRefs.length > 0
          ? '纪念空间已更新，新的照片已经保存，不想保留的照片也已移走。'
          : addPhotoUrls.length > 0
            ? '纪念空间已更新，新的照片和回忆已经保存。'
            : payload.removePhotoRefs.length > 0
              ? '纪念空间已更新，不想保留的照片已经移走。'
              : '纪念空间已更新。'
      )
    } catch (error) {
      console.error(error)
      setMemoryError(error instanceof Error ? error.message : '保存回忆失败')
    } finally {
      setIsSavingMemorial(false)
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 pb-24">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* 像素宠物场景 */}
        <PixelPetEngine
          spiritType={spirit.spiritType}
          mood={mood as 'sleepy' | 'playful' | 'content' | 'curious' | 'happy'}
          homeStyle={spirit.homeStyle as 'cozy_room' | 'garden' | 'cloud_loft' | 'mountain_cabin'}
          name={spirit.name}
          statusText={statusText}
          decor={spirit.personality?.decor}
        />

        <div className="flex items-center justify-center gap-2 mt-4 mb-6">
          <span className="text-sm text-stone-500">{moodInfo.label}</span>
          <span>{moodInfo.emoji}</span>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm leading-7 text-stone-500">
            这是你为 <span className="font-medium text-stone-700">{spirit.name}</span> 保存回忆的默认私密空间。
            现在我们先把纪念、照片和回访这条主链路做好；聊天、祈福和更复杂的互动能力会在后续阶段审慎解锁。
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-full bg-amber-600 px-5 py-3 text-sm text-white transition-colors hover:bg-amber-700"
            >
              返回我的空间
            </button>
            {spirit.shareEnabled ? (
              <>
                <Link
                  href={`/share/${spirit.id}`}
                  className="rounded-full border border-stone-300 px-5 py-3 text-center text-sm text-stone-600 transition-colors hover:bg-stone-100"
                >
                  打开纪念页
                </Link>
                <button
                  onClick={copyShareLink}
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-100"
                >
                  复制分享链接
                </button>
                <button
                  onClick={() => toggleShare(false)}
                  disabled={updatingShare}
                  className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-500 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updatingShare ? '更新中...' : '关闭亲友分享'}
                </button>
              </>
            ) : (
              <button
                onClick={() => toggleShare(true)}
                disabled={updatingShare}
                className="rounded-full border border-dashed border-amber-400 px-5 py-3 text-sm text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingShare ? '开启中...' : '开启给亲友的纪念页'}
              </button>
            )}
          </div>
          <p className="mt-3 text-xs leading-6 text-stone-400">
            {spirit.shareEnabled
              ? '当前纪念页可通过专属链接访问，搜索引擎不会收录。你仍然可以随时关闭它。'
              : '分享默认关闭。只有你主动开启后，亲友才能通过纪念页链接进入。'}
          </p>
          {shareNotice && <p className="mt-3 text-xs leading-6 text-emerald-600">{shareNotice}</p>}
          {shareError && <p className="mt-3 text-xs leading-6 text-red-500">{shareError}</p>}
        </div>

        <div className={`mb-8 rounded-2xl p-5 shadow-sm ${insightToneClass}`}>
          <p className="text-xs uppercase tracking-[0.24em] opacity-70">Return Reason</p>
          <h2 className="mt-3 text-xl font-light">{memorialInsight.title}</h2>
          <p className="mt-3 text-sm leading-7 opacity-85">{memorialInsight.body}</p>
          {memorialInsight.category === 'memory' && (
            <button
              onClick={() => {
                setMemoryError('')
                setMemoryNotice('')
                setShowEditDialog(true)
              }}
              className="mt-4 rounded-full border border-current/20 px-5 py-3 text-sm transition-colors hover:bg-white/40"
            >
              现在去补一件小事
            </button>
          )}
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Memorial Progress</p>
              <h2 className="mt-3 text-xl font-light text-stone-700">{memorialRoadmap.title}</h2>
            </div>
            <div className="rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-700">
              {memorialRoadmap.doneCount} / {memorialRoadmap.totalCount}
            </div>
          </div>
          <p className="mt-3 text-sm leading-7 text-stone-500">{memorialRoadmap.summary}</p>
          <div className="mt-5 space-y-3">
            {memorialRoadmap.items.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl px-4 py-4 ${
                  item.state === 'done' ? 'bg-emerald-50' : 'bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-stone-700">{item.title}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      item.state === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.state === 'done' ? '已留下' : '下一步'}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-stone-500">{item.hint}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Next Best Step</p>
            <p className="mt-2 text-sm leading-7 text-amber-900">{memorialRoadmap.nextStep}</p>
          </div>
          <button
            onClick={() => {
              setMemoryError('')
              setMemoryNotice('')
              setShowEditDialog(true)
            }}
            className="mt-5 rounded-full border border-dashed border-amber-400 px-5 py-3 text-sm text-amber-700 transition-colors hover:bg-amber-50"
          >
            继续把这个空间补完整
          </button>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm text-stone-400">继续完善这个空间</h2>
              <p className="mt-3 text-sm leading-7 text-stone-500">
                这里最该继续补的是照片、故事和重要日子。先把这个空间补得更像你记得的它，比扩更多功能更重要。
              </p>
              <p className="mt-2 text-xs leading-6 text-stone-400">
                当前已保存 {spirit.photoUrls.length} / {MAX_TOTAL_PHOTOS} 张照片。
              </p>
            </div>
            <button
              onClick={() => {
                setMemoryError('')
                setMemoryNotice('')
                setShowEditDialog(true)
              }}
              className="rounded-full border border-dashed border-amber-400 px-5 py-3 text-sm text-amber-700 transition-colors hover:bg-amber-50"
            >
              继续补充回忆
            </button>
          </div>
          {memoryNotice && <p className="mt-4 text-xs leading-6 text-emerald-600">{memoryNotice}</p>}
          {memoryError && <p className="mt-4 text-xs leading-6 text-red-500">{memoryError}</p>}
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm text-stone-400">纪念信息</h2>
          {memorialFacts.length > 0 ? (
            <div className="mt-3 space-y-3">
              {memorialFacts.map((fact) => (
                <div key={fact.label} className="flex items-start justify-between gap-4 border-b border-stone-100 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-sm text-stone-400">{fact.label}</span>
                  <span className="text-sm text-right text-stone-700">{fact.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-7 text-stone-500">
              这里还没写下重要日子或家人怎么叫它。补一补，会让这个空间更像你真正记得的它。
            </p>
          )}
        </div>

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm text-stone-400">它最像它的样子</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {spirit.personality.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-amber-50 px-3 py-1.5 text-sm text-amber-700"
              >
                {tag}
              </span>
            ))}
          </div>

          {personalityNotes.length > 0 ? (
            <div className="mt-4 space-y-4">
              {personalityNotes.map((item) => (
                <div key={item.label} className="rounded-2xl bg-stone-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600 whitespace-pre-wrap">{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-stone-500">
              你已经选了最基础的性格标签。下次可以再写下它的习惯、怪癖和最让人笑的一件事，让这个空间更像它。
            </p>
          )}
        </div>

        {memorialTimeline.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-sm text-stone-400">纪念时间线</h2>
            <div className="mt-4 space-y-4">
              {memorialTimeline.map((item, index) => (
                <div key={`${item.label}-${item.value}`} className="flex gap-4">
                  <div className="flex w-16 shrink-0 flex-col items-center pt-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    {index < memorialTimeline.length - 1 && (
                      <span className="mt-2 h-full w-px bg-stone-200" />
                    )}
                  </div>
                  <div className="min-w-0 rounded-2xl bg-stone-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-400">{item.label}</p>
                    <p className="mt-2 text-sm text-stone-700">{item.value}</p>
                    <p className="mt-2 text-sm leading-7 text-stone-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-sm text-stone-400">数据与权限</h2>
          <p className="mt-3 text-sm leading-7 text-stone-500">
            你可以先导出一份纪念备份，再决定是否保留这个空间。导出文件会带上纪念信息、最近记录、对话、祈福，以及临时照片下载链接。
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <button
              onClick={exportMemorial}
              disabled={isExporting}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? '导出中...' : '导出纪念备份'}
            </button>
            <button
              onClick={() => {
                setDataError('')
                setDataNotice('')
                setDeleteConfirmValue('')
                setShowDeleteDialog(true)
              }}
              disabled={isDeleting}
              className="rounded-full border border-red-200 px-5 py-3 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? '删除中...' : '永久删除纪念空间'}
            </button>
          </div>
          <p className="mt-3 text-xs leading-6 text-stone-400">
            删除会同时移除当前纪念空间的照片引用、记录、对话和祈福数据。若要保留资料，建议先导出。
          </p>
          {dataNotice && <p className="mt-3 text-xs leading-6 text-emerald-600">{dataNotice}</p>}
          {dataError && <p className="mt-3 text-xs leading-6 text-red-500">{dataError}</p>}
        </div>

        <div className="mb-8">
          <FeedbackPromptCard
            href={feedbackHref}
            title="这页的体验有哪里该继续打磨？"
            body="例如你是否愿意回来看看、分享是否足够安心、导出和删除是否让你放心，或者你最想补的下一步。"
            cta="反馈这一页"
          />
        </div>

        {/* 照片相册 */}
        {spirit.photoUrls?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm text-stone-400 mb-3">回忆相册</h2>
            <div className="grid grid-cols-3 gap-2">
              {spirit.photoUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setViewPhoto(url)}
                  className="relative aspect-square rounded-xl overflow-hidden"
                >
                  <Image
                    src={url}
                    alt={`${spirit.name} 的回忆照片 ${i + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 33vw, 180px"
                    className="object-cover transition-transform hover:scale-105"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 照片查看器 */}
        {viewPhoto && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setViewPhoto(null)}>
            <div className="relative h-full w-full">
              <Image
                src={viewPhoto}
                alt={`${spirit.name} 的放大照片`}
                fill
                unoptimized
                sizes="100vw"
                className="rounded-2xl object-contain"
              />
            </div>
          </div>
        )}

        {/* 最近动态 */}
        <div>
          <h2 className="text-sm text-stone-400 mb-3">最近记录</h2>
          <div className="space-y-3">
            {spirit.statuses.map((status) => (
              <div key={status.id} className="flex items-start gap-3">
                <span className="text-xs text-stone-400 w-12 pt-0.5">
                  {new Date(status.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex-1 bg-white rounded-xl px-4 py-2.5 shadow-sm">
                  <p className="text-sm text-stone-600">{status.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <DeleteMemorialDialog
          name={spirit.name}
          confirmValue={deleteConfirmValue}
          isDeleting={isDeleting}
          isExporting={isExporting}
          notice={dataNotice}
          error={dataError}
          onConfirmValueChange={setDeleteConfirmValue}
          onCancel={() => {
            if (isDeleting) return
            setShowDeleteDialog(false)
            setDeleteConfirmValue('')
            setDataError('')
          }}
          onExport={exportMemorial}
          onConfirmDelete={deleteMemorial}
        />
      )}

      {showEditDialog && (
        <EditMemorialDialog
          spirit={spirit}
          isSaving={isSavingMemorial}
          error={memoryError}
          onCancel={() => {
            if (isSavingMemorial) return
            setShowEditDialog(false)
            setMemoryError('')
          }}
          onSubmit={saveMemorial}
        />
      )}
    </main>
  )
}
