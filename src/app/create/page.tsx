'use client'

import { useState } from 'react'
import Image from 'next/image'
import { usePrivy } from '@privy-io/react-auth'
import { SPIRIT_TYPES, PERSONALITY_TAGS, HOME_STYLES } from '@/lib/constants'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import BirthAnimation from '@/components/BirthAnimation'
import { LoginButton } from '@/components/LoginButton'
import { AuthLoadingState } from '@/components/AuthLoadingState'
import type { SpiritType } from '@/lib/constants'

type Step = 1 | 2 | 3 | 4

async function readResponsePayload(res: Response) {
  const contentType = res.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return res.json()
  }

  const text = await res.text()
  return text ? { error: text } : {}
}

export default function CreatePage() {
  const [step, setStep] = useState<Step>(1)
  const [spiritType, setSpiritType] = useState<SpiritType | ''>('')
  const { ready, authenticated } = usePrivy()
  const [name, setName] = useState('')
  const authFetch = useAuthFetch()
  const [nickname, setNickname] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [habits, setHabits] = useState('')
  const [funnyStory, setFunnyStory] = useState('')
  const [homeStyle, setHomeStyle] = useState('cozy_room')
  const [birthday, setBirthday] = useState('')
  const [passedDate, setPassedDate] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [birthData, setBirthData] = useState<{ id: string; name: string; spiritType: string; homeStyle: string } | null>(null)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (photos.length + files.length > 9) return
    setPhotos(prev => [...prev, ...files])
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      setPhotoPreviews(prev => [...prev, url])
    })
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : prev.length < 6 ? [...prev, tag] : prev
    )
  }

  const canNext = () => {
    if (step === 1) return spiritType && name.trim()
    if (step === 2) return true // 照片暂时可选
    if (step === 3) return selectedTags.length > 0
    return true
  }

  const createTypeOptions = (Object.entries(SPIRIT_TYPES) as [SpiritType, string][])
    .filter(([key]) => key !== 'human')

  if (birthData) {
    return (
      <BirthAnimation
        spiritId={birthData.id}
        name={birthData.name}
        spiritType={birthData.spiritType}
        homeStyle={birthData.homeStyle}
      />
    )
  }

  if (!ready) {
    return (
      <AuthLoadingState
        title="正在准备创建流程"
        body="创建页需要先连接登录服务。要是这里停留太久，通常是 Privy 的 localhost 域名还没在控制台放行。"
      />
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-amber-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-stone-400">Create Memorial</p>
          <h1 className="mt-4 text-3xl font-light text-stone-700">先登录，再为它创建纪念空间</h1>
          <p className="mt-4 text-sm leading-7 text-stone-500">
            我们把纪念空间默认设为私密，这样照片、故事和重要日子都会先只属于你。
          </p>
          <div className="mt-8">
            <LoginButton
              label="登录并开始创建"
              className="inline-flex rounded-full bg-amber-600 px-8 py-3 text-white transition-colors hover:bg-amber-700"
            />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-amber-50 flex flex-col items-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="mb-8 rounded-[2rem] bg-white px-5 py-5 shadow-sm">
          <p className="text-sm leading-7 text-stone-500">在你开始之前,我们想先说三件事:</p>
          <p className="mt-3 text-sm leading-7 text-stone-500">
            这个纪念空间<span className="font-medium text-stone-700">默认只有你能看</span>。除非你主动生成分享链接,否则没有任何人能进来 — 包括我们团队。
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-500">
            <span className="font-medium text-stone-700">你可以随时删除</span>。删除之后,照片、故事、所有记录都会从我们的服务器上清除。不会留一份&quot;用户导出存档&quot;之类的东西。
          </p>
          <p className="mt-3 text-sm leading-7 text-stone-500">
            <span className="font-medium text-stone-700">你可以随时导出</span>。你上传的所有内容,随时可以打包下载一份,带走,或者留在自己的电脑里。
          </p>
        </div>

        {/* 进度条 */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-amber-500' : 'bg-stone-200'}`}
            />
          ))}
        </div>

        {/* Step 1: 基本信息 */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl text-stone-700">先为它留下一张纪念名片</h2>
            <p className="text-sm leading-6 text-stone-500">
              第一阶段只需要最基础的信息。你之后还可以继续补充照片、故事和重要时刻。
            </p>

            <div className="space-y-3">
              <p className="text-sm text-stone-500">它是...</p>
              <div className="grid grid-cols-2 gap-3">
                {createTypeOptions.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSpiritType(key)}
                    className={`py-3 px-4 rounded-xl border text-sm transition-colors ${
                      spiritType === key
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-500">它的名字</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例如：小圆"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-500">家人怎么叫它（选填）</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="例如：圆圆、小胖子"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-white"
              />
            </div>
          </div>
        )}

        {/* Step 2: 上传照片 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl text-stone-700">放进第一批回忆照片</h2>
            <p className="text-sm text-stone-400">这些照片会成为纪念空间里最先被保存下来的画面，之后也可以继续补充。</p>
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-sm leading-7 text-stone-500">照片上传后,存在一个<span className="font-medium text-stone-700">只有你能访问</span>的私有存储里。</p>
              <p className="text-sm leading-7 text-stone-500">分享链接里的照片会用临时签名 URL,过期自动失效。</p>
              <p className="mt-3 text-sm leading-7 text-stone-500">
                我们<span className="font-medium text-stone-700">不会</span>把你的照片发给第三方 AI 做训练,也<span className="font-medium text-stone-700">不会</span>把它放进任何公开的展示集。
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {photoPreviews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <Image
                    src={url}
                    alt={`待上传照片 ${i + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 33vw, 160px"
                    className="object-cover"
                  />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {photos.length < 9 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-colors cursor-pointer">
                  <span className="text-2xl">+</span>
                  <span className="text-xs mt-1">照片</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <p className="text-xs text-stone-400">
              {photos.length > 0 ? `已选${photos.length}张照片` : '可以先跳过，之后再补充'}
            </p>
          </div>
        )}

        {/* Step 3: 性格描述 */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl text-stone-700">写下它最像它的样子</h2>
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-xs leading-6 text-stone-500">你写的每一个字,都只有你能看到。</p>
              <p className="text-xs leading-6 text-stone-500">
                如果你以后开启分享,你的纪念空间会整体对你信任的人可见 — 但只有你能修改。
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-stone-500">快速选择（最多6个）</p>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-amber-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-500">它有什么特别的习惯或怪癖？</label>
              <textarea
                value={habits}
                onChange={e => setHabits(e.target.value)}
                placeholder="例如：喜欢吃手指、总是帮别的猫埋屎、一听到零食袋响就跑过来..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-stone-500">它最让你笑的一件事？</label>
              <textarea
                value={funnyStory}
                onChange={e => setFunnyStory(e.target.value)}
                placeholder="随便写，这会让纪念空间更像你记得的它"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 4: 选择家 */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl text-stone-700">选择纪念空间的风格</h2>
            <p className="text-sm text-stone-400">这里只是第一版呈现方式，之后还可以慢慢补充和调整。</p>

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(HOME_STYLES).map(([key, label]) => {
                const icons: Record<string, string> = {
                  cozy_room: '🏠', garden: '🌳', cloud_loft: '☁️', mountain_cabin: '🏔️'
                }
                return (
                  <button
                    key={key}
                    onClick={() => setHomeStyle(key)}
                    className={`py-6 px-4 rounded-xl border text-center transition-colors ${
                      homeStyle === key
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{icons[key]}</span>
                    <span className="text-sm text-stone-600">{label}</span>
                  </button>
                )
              })}
            </div>

            {/* 特殊日期 */}
            <div className="space-y-3 pt-4">
              <h3 className="text-sm text-stone-500">记住重要的日子（选填）</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">生日</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={e => setBirthday(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">离开的日子</label>
                  <input
                    type="date"
                    value={passedDate}
                    onChange={e => setPassedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 导航按钮 */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep((step - 1) as Step)}
              className="flex-1 py-3 border border-stone-300 text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
            >
              上一步
            </button>
          )}
          <button
            onClick={async () => {
              if (step < 4) {
                setStep((step + 1) as Step)
              } else {
                setIsCreating(true)
                setCreateError('')
                try {
                  // 上传照片
                  let photoUrls: string[] = []
                  if (photos.length > 0) {
                    photoUrls = await Promise.all(
                      photos.map(async (photo) => {
                        const formData = new FormData()
                        formData.append('photos', photo)

                        const uploadRes = await authFetch('/api/upload', { method: 'POST', body: formData })
                        const uploadData = await readResponsePayload(uploadRes)

                        if (!uploadRes.ok) {
                          throw new Error(uploadData.error || '照片上传失败')
                        }

                        const uploadedPath = uploadData.paths?.[0]
                        if (!uploadedPath) {
                          throw new Error('照片上传失败')
                        }

                        return uploadedPath
                      })
                    )
                  }

                  const res = await authFetch('/api/spirit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: name.trim(),
                      spiritType,
                      personality: {
                        nickname: nickname.trim() || undefined,
                        tags: selectedTags,
                        habits: habits.trim() || undefined,
                        funnyStory: funnyStory.trim() || undefined,
                        birthday: birthday || undefined,
                        passedDate: passedDate || undefined,
                      },
                      homeStyle,
                      photoUrls,
                    }),
                  })
                  const data = await readResponsePayload(res)
                  if (res.ok) {
                    setBirthData({
                      id: data.spirit.id,
                      name: data.spirit.name,
                      spiritType: data.spirit.spiritType,
                      homeStyle: data.spirit.homeStyle,
                    })
                  } else {
                    setCreateError(data.error || '创建失败，请重试')
                  }
                } catch (e) {
                  console.error(e)
                  setCreateError(e instanceof Error ? e.message : '创建失败，请稍后再试')
                } finally {
                  setIsCreating(false)
                }
              }
            }}
            disabled={!canNext() || isCreating}
            className={`flex-1 py-3 rounded-full transition-colors ${
              canNext() && !isCreating
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {step === 4 ? (isCreating ? '创建中...' : '创建纪念空间') : '下一步'}
          </button>
        </div>
        <p className="mt-3 text-center text-xs leading-6 text-stone-400">不收费 · 你决定谁能看 · 你决定留多久</p>
        {createError && (
          <p className="text-red-500 text-sm text-center mt-3">{createError}</p>
        )}
      </div>
    </main>
  )
}
