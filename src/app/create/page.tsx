'use client'

import { useState } from 'react'
import { SPIRIT_TYPES, PERSONALITY_TAGS, HOME_STYLES } from '@/lib/constants'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import BirthAnimation from '@/components/BirthAnimation'
import type { SpiritType } from '@/lib/constants'

type Step = 1 | 2 | 3 | 4

export default function CreatePage() {
  const [step, setStep] = useState<Step>(1)
  const [spiritType, setSpiritType] = useState<SpiritType | ''>('')
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
    if (step === 1) return spiritType && name
    if (step === 2) return true // 照片暂时可选
    if (step === 3) return selectedTags.length > 0
    return true
  }

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

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12">
      <div className="max-w-md w-full">
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
            <h2 className="text-xl text-stone-700">告诉我们关于它的故事</h2>

            <div className="space-y-3">
              <p className="text-sm text-stone-500">它是...</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(SPIRIT_TYPES) as [SpiritType, string][]).map(([key, label]) => (
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
            <h2 className="text-xl text-stone-700">分享它的照片</h2>
            <p className="text-sm text-stone-400">上传越多，它的数字分身越像它（之后还可以继续补充）</p>

            <div className="grid grid-cols-3 gap-3">
              {photoPreviews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
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
            <h2 className="text-xl text-stone-700">它是什么样的性格？</h2>

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
                placeholder="随便写，这会让它的数字分身更像它"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none bg-white resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 4: 选择家 */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl text-stone-700">在彼岸世界，它的家是什么样的？</h2>
            <p className="text-sm text-stone-400">之后可以随时更换和装饰</p>

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
                try {
                  // 上传照片
                  let photoUrls: string[] = []
                  if (photos.length > 0) {
                    const formData = new FormData()
                    photos.forEach(f => formData.append('photos', f))
                    const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
                    const uploadData = await uploadRes.json()
                    if (uploadData.urls) photoUrls = uploadData.urls
                  }

                  const res = await authFetch('/api/spirit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name,
                      spiritType,
                      personality: { tags: selectedTags, habits, funnyStory, birthday: birthday || undefined, passedDate: passedDate || undefined },
                      homeStyle,
                      photoUrls,
                    }),
                  })
                  const data = await res.json()
                  if (res.ok) {
                    setBirthData({
                      id: data.spirit.id,
                      name: data.spirit.name,
                      spiritType: data.spirit.spiritType,
                      homeStyle: data.spirit.homeStyle,
                    })
                  } else {
                    alert(`创建失败: ${data.error || '未知错误'}`)
                  }
                } catch (e) {
                  console.error(e)
                  alert('创建失败，请检查网络连接后重试')
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
            {step === 4 ? (isCreating ? '创建中...' : '创建分身') : '下一步'}
          </button>
        </div>
      </div>
    </main>
  )
}
