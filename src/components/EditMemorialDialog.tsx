'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

import { PERSONALITY_TAGS } from '@/lib/constants'

const MAX_TOTAL_PHOTOS = 18

interface SpiritPersonality {
  nickname?: string
  tags: string[]
  habits?: string
  funnyStory?: string
  birthday?: string
  passedDate?: string
}

interface EditMemorialDialogProps {
  spirit: {
    name: string
    photoRefs?: string[]
    photoUrls: string[]
    personality: SpiritPersonality
  }
  isSaving: boolean
  error?: string
  onCancel: () => void
  onSubmit: (payload: {
    name: string
    personality: SpiritPersonality
    newPhotos: File[]
    removePhotoRefs: string[]
  }) => Promise<void>
}

export function EditMemorialDialog({
  spirit,
  isSaving,
  error,
  onCancel,
  onSubmit,
}: EditMemorialDialogProps) {
  const [name, setName] = useState(spirit.name)
  const [nickname, setNickname] = useState(spirit.personality.nickname || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(spirit.personality.tags || [])
  const [habits, setHabits] = useState(spirit.personality.habits || '')
  const [funnyStory, setFunnyStory] = useState(spirit.personality.funnyStory || '')
  const [birthday, setBirthday] = useState(spirit.personality.birthday || '')
  const [passedDate, setPassedDate] = useState(spirit.personality.passedDate || '')
  const [keptExistingPhotos, setKeptExistingPhotos] = useState(() =>
    spirit.photoUrls.map((url, index) => ({
      ref: spirit.photoRefs?.[index] || spirit.photoUrls[index],
      url,
    }))
  )
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const previewUrlsRef = useRef<string[]>([])

  useEffect(() => {
    previewUrlsRef.current = photoPreviews
  }, [photoPreviews])

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const remainingPhotoSlots = Math.max(0, MAX_TOTAL_PHOTOS - keptExistingPhotos.length - newPhotos.length)

  const toggleTag = (tag: string) => {
    setSelectedTags((current) => {
      if (current.includes(tag)) {
        return current.filter((item) => item !== tag)
      }

      if (current.length >= 6) {
        return current
      }

      return [...current, tag]
    })
  }

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0 || remainingPhotoSlots <= 0) {
      return
    }

    const acceptedFiles = files.slice(0, remainingPhotoSlots)
    setNewPhotos((current) => [...current, ...acceptedFiles])
    setPhotoPreviews((current) => [
      ...current,
      ...acceptedFiles.map((file) => URL.createObjectURL(file)),
    ])
    event.target.value = ''
  }

  const removePhoto = (index: number) => {
    setNewPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index))
    setPhotoPreviews((current) => {
      URL.revokeObjectURL(current[index])
      return current.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  const removeExistingPhoto = (ref: string) => {
    setKeptExistingPhotos((current) => current.filter((photo) => photo.ref !== ref))
  }

  const handleSubmit = async () => {
    if (!name.trim() || selectedTags.length === 0 || isSaving) {
      return
    }

    const removePhotoRefs = (spirit.photoRefs || spirit.photoUrls).filter(
      (ref) => !keptExistingPhotos.some((photo) => photo.ref === ref)
    )

    await onSubmit({
      name: name.trim(),
      personality: {
        nickname: nickname.trim() || undefined,
        tags: selectedTags,
        habits: habits.trim() || undefined,
        funnyStory: funnyStory.trim() || undefined,
        birthday: birthday || undefined,
        passedDate: passedDate || undefined,
      },
      newPhotos,
      removePhotoRefs,
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/55 px-6 py-8">
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-amber-500">Memorial Editor</p>
        <h2 className="mt-4 text-2xl font-light text-stone-800">继续补充回忆</h2>
        <p className="mt-3 text-sm leading-7 text-stone-500">
          先把这里补得更像你记得的它。照片、习惯、名字故事和重要日子，比新增功能更重要。
        </p>

        <div className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-stone-500">它的名字</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-stone-500">家人怎么叫它</label>
              <input
                type="text"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="例如：圆圆、小胖子"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-stone-500">哪些词最像它（最多 6 个）</label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-stone-500">它的习惯和怪癖</label>
              <textarea
                value={habits}
                onChange={(event) => setHabits(event.target.value)}
                placeholder="例如：总是听到零食袋响就跑过来"
                rows={4}
                className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-stone-500">最让你笑的一件事</label>
              <textarea
                value={funnyStory}
                onChange={(event) => setFunnyStory(event.target.value)}
                placeholder="例如：它做过哪件事让全家都记到现在"
                rows={4}
                className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-stone-500">生日</label>
              <input
                type="date"
                value={birthday}
                onChange={(event) => setBirthday(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-stone-500">离开的日子</label>
              <input
                type="date"
                value={passedDate}
                onChange={(event) => setPassedDate(event.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-stone-50 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-stone-600">继续补照片</p>
                <p className="mt-1 text-xs leading-6 text-stone-400">
                  当前保留 {keptExistingPhotos.length} 张，本轮最多还能再补 {remainingPhotoSlots} 张。
                </p>
              </div>
              {remainingPhotoSlots > 0 && (
                <label className="shrink-0 cursor-pointer rounded-full border border-dashed border-amber-400 px-4 py-2 text-sm text-amber-700 transition-colors hover:bg-amber-50">
                  选择照片
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

            {spirit.photoUrls.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs leading-6 text-stone-400">
                  不想继续留在纪念空间里的照片，可以直接在这里移走。
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {keptExistingPhotos.map((photo, index) => (
                    <div key={photo.ref} className="relative aspect-square overflow-hidden rounded-xl">
                      <Image
                        src={photo.url}
                        alt={`已保存照片 ${index + 1}`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 33vw, 180px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(photo.ref)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-xs text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {keptExistingPhotos.length === 0 && (
                  <p className="rounded-xl bg-white px-4 py-3 text-sm leading-6 text-stone-500">
                    这次会把当前已保存的照片全部移走，只保留你新补充的内容。
                  </p>
                )}
              </div>
            )}

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photoPreviews.map((preview, index) => (
                  <div key={preview} className="relative aspect-square overflow-hidden rounded-xl">
                    <Image
                      src={preview}
                      alt={`待补充照片 ${index + 1}`}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 33vw, 180px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-xs text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-5 text-sm leading-6 text-red-500">{error}</p>
        )}

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-600 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || selectedTags.length === 0 || isSaving}
            className="flex-1 rounded-full bg-amber-600 px-5 py-3 text-sm text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? '保存中...' : '保存这些回忆'}
          </button>
        </div>
      </div>
    </div>
  )
}
