'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import { readResponsePayload } from '@/lib/read-response-payload'

interface Answers {
  who: string; feeling: string; comeback: string; feature: string
  wanted: string; price: string; share: string; other: string
}

interface Option {
  v: string
  l: string
}

interface FeedbackSourceConfig {
  label: string
  featureQuestion: string
  featureOptions: Option[]
  wantedQuestion: string
  wantedOptions: Option[]
  returnHref: string
  returnLabel: string
}

interface FeedbackContextSnapshot {
  progressLabel: string
  nextStep: string
  photoCount: number | null
  shareEnabled: boolean | null
  returnReason: string
}

function getFeedbackSourceConfig(source: string, spiritId: string): FeedbackSourceConfig {
  switch (source) {
    case 'homepage':
      return {
        label: '首页',
        featureQuestion: '4. 首页里最打动你或最让你愿意继续点进去的是什么？',
        featureOptions: [
          { v: 'positioning', l: '🕯️ 产品定位和承诺' },
          { v: 'privacy', l: '🔒 默认私密的感觉' },
          { v: 'memorial_space', l: '🏠 纪念空间这个概念' },
          { v: 'create_cta', l: '➡️ 创建入口' },
          { v: 'not_sure', l: '🤷 还没有特别被打动' },
        ],
        wantedQuestion: '5. 如果下一步只补一件事，你最想在首页看到什么？',
        wantedOptions: [
          { v: 'examples', l: '🧭 更清楚的示例与解释' },
          { v: 'create_flow', l: '✍️ 更顺的创建流程' },
          { v: 'privacy_detail', l: '🔒 更明确的私密与分享说明' },
          { v: 'photo_memories', l: '📸 照片与回忆整理能力' },
          { v: 'return_reason', l: '🔁 让我以后愿意回来看的理由' },
        ],
        returnHref: '/',
        returnLabel: '回到首页',
      }
    case 'beta_invite':
      return {
        label: '内测邀请页',
        featureQuestion: '4. 看到这页后，你最在意或最想确认的是什么？',
        featureOptions: [
          { v: 'positioning', l: '🕯️ 它到底是不是纪念空间' },
          { v: 'privacy', l: '🔒 默认私密和边界感' },
          { v: 'trust', l: '🛟 导出、删除、分享这些信任问题' },
          { v: 'effort', l: '⏱️ 体验门槛和投入时间' },
          { v: 'not_sure', l: '🤷 还没被打动或还不确定' },
        ],
        wantedQuestion: '5. 如果决定试一试，你最希望开始前先看到什么？',
        wantedOptions: [
          { v: 'examples', l: '🧭 一两个真实示例' },
          { v: 'privacy_detail', l: '🔒 更明确的私密和分享说明' },
          { v: 'expectations', l: '⏱️ 更清楚的测试步骤和时间预期' },
          { v: 'value', l: '🤍 更清楚为什么值得回来' },
          { v: 'trust', l: '🛟 更清楚导出和删除保障' },
        ],
        returnHref: '/beta',
        returnLabel: '回到内测邀请页',
      }
    case 'sample_memorial':
      return {
        label: '样例纪念空间',
        featureQuestion: '4. 这个做好的样例里，哪一部分最像一个你愿意停留的纪念空间？',
        featureOptions: [
          { v: 'photos', l: '📸 照片和整体氛围' },
          { v: 'story', l: '📝 名字、习惯和故事' },
          { v: 'status', l: '🌤️ 最近纪念记录' },
          { v: 'trust', l: '🛟 私密、分享、导出这些边界' },
          { v: 'not_sure', l: '🤷 还是没太被说服' },
        ],
        wantedQuestion: '5. 如果换成你自己的宠物，你最希望这里再多一点什么？',
        wantedOptions: [
          { v: 'examples', l: '🧭 更多完成态示例' },
          { v: 'create_guidance', l: '✍️ 更顺的创建引导' },
          { v: 'privacy_detail', l: '🔒 更明确的私密和分享说明' },
          { v: 'family_share', l: '👥 更适合发给亲友的体验' },
          { v: 'return_reason', l: '🔁 更强的回来看理由' },
        ],
        returnHref: '/sample/shixiaoyuan',
        returnLabel: '回到样例纪念空间',
      }
    case 'dashboard':
      return {
        label: '我的纪念空间列表',
        featureQuestion: '4. 回到 dashboard 时，哪一部分最让你觉得顺或者安心？',
        featureOptions: [
          { v: 'list', l: '📚 空间列表本身' },
          { v: 'detail_entry', l: '➡️ 进入纪念空间详情' },
          { v: 'create_entry', l: '➕ 创建新空间入口' },
          { v: 'privacy', l: '🔒 私密感和边界感' },
          { v: 'not_sure', l: '🤷 目前还没有明显亮点' },
        ],
        wantedQuestion: '5. 如果下一步只补一件事，你最想补 dashboard 的什么？',
        wantedOptions: [
          { v: 'sorting', l: '🗂️ 更清楚的列表与整理方式' },
          { v: 'status_summary', l: '🌤️ 更好的最近记录摘要' },
          { v: 'return_context', l: '🔁 更强的回访感和提醒感' },
          { v: 'share_status', l: '🔒 更清楚的分享状态提示' },
          { v: 'creation_guidance', l: '🧭 更明确的下一步引导' },
        ],
        returnHref: '/dashboard',
        returnLabel: '回到我的纪念空间',
      }
    case 'spirit_detail':
      return {
        label: '纪念空间详情页',
        featureQuestion: '4. 这页里目前最有价值的部分是什么？',
        featureOptions: [
          { v: 'photos', l: '📸 回忆相册' },
          { v: 'status', l: '🌤️ 最近记录与回访感' },
          { v: 'facts', l: '📝 纪念信息与名字故事' },
          { v: 'sharing', l: '🔗 分享控制' },
          { v: 'export_delete', l: '🛟 导出与删除的安心感' },
        ],
        wantedQuestion: '5. 如果下一步只补一件事，你最想把详情页补成什么样？',
        wantedOptions: [
          { v: 'memory_edit', l: '✍️ 更方便补充回忆与故事' },
          { v: 'family_share', l: '👥 更稳的亲友分享体验' },
          { v: 'memorial_day', l: '📅 纪念日与重要日子提醒' },
          { v: 'status_quality', l: '🌤️ 更像它的回访动态' },
          { v: 'album_organize', l: '🖼️ 更好的相册整理' },
        ],
        returnHref: spiritId ? `/spirit/${spiritId}` : '/dashboard',
        returnLabel: spiritId ? '回到纪念空间详情' : '回到我的纪念空间',
      }
    case 'memorial_chat':
      return {
        label: '纪念对话内测',
        featureQuestion: '4. 纪念对话里目前最成立或最不成立的点是什么？',
        featureOptions: [
          { v: 'tone', l: '💬 说话语气像不像它' },
          { v: 'comfort', l: '🤍 有没有陪伴感' },
          { v: 'awkward', l: '😬 是否有尴尬或违和感' },
          { v: 'memory', l: '🧠 是否记得你们的故事' },
          { v: 'not_needed', l: '🛑 这条线也许不该继续' },
        ],
        wantedQuestion: '5. 如果下一步只改一件事，你最想改纪念对话的什么？',
        wantedOptions: [
          { v: 'more_real', l: '🎭 更像它本来的性格' },
          { v: 'less_frequent', l: '🫧 更克制，不要太多' },
          { v: 'memory', l: '🧠 更会记住你说过的话' },
          { v: 'guidance', l: '🧭 更清楚的使用边界说明' },
          { v: 'remove', l: '✂️ 暂时不要这条线' },
        ],
        returnHref: spiritId ? `/chat/${spiritId}` : '/dashboard',
        returnLabel: spiritId ? '回到纪念对话' : '回到我的纪念空间',
      }
    case 'memorial_bless':
      return {
        label: '祈福内测',
        featureQuestion: '4. 祈福动作里最让你在意的是什么？',
        featureOptions: [
          { v: 'ritual', l: '🕯️ 仪式感' },
          { v: 'awkward', l: '😬 会不会显得尴尬或多余' },
          { v: 'comfort', l: '🤍 有没有安慰感' },
          { v: 'pricing', l: '💸 价格和动作设计' },
          { v: 'not_needed', l: '🛑 这条线也许不该继续' },
        ],
        wantedQuestion: '5. 如果下一步只改一件事，你最想改祈福的什么？',
        wantedOptions: [
          { v: 'free_options', l: '🫶 更多不付费的纪念动作' },
          { v: 'copy', l: '✍️ 更合适的文案和语气' },
          { v: 'ritual_design', l: '🕯️ 更好的仪式设计' },
          { v: 'family', l: '👥 更适合亲友一起参与' },
          { v: 'remove', l: '✂️ 暂时不要这条线' },
        ],
        returnHref: spiritId ? `/spirit/${spiritId}/bless` : '/dashboard',
        returnLabel: spiritId ? '回到祈福内测' : '回到我的纪念空间',
      }
    case 'memorial_decor':
      return {
        label: '装饰空间内测',
        featureQuestion: '4. 装饰空间里最让你觉得有价值或没必要的是什么？',
        featureOptions: [
          { v: 'cute', l: '🧸 可爱和情感连接' },
          { v: 'personal', l: '🎨 个性化表达' },
          { v: 'shop', l: '🛍️ 商店和购买感' },
          { v: 'awkward', l: '😬 是否显得跑题' },
          { v: 'not_needed', l: '🛑 这条线也许不该继续' },
        ],
        wantedQuestion: '5. 如果下一步只改一件事，你最想改装饰空间的什么？',
        wantedOptions: [
          { v: 'more_meaningful', l: '🫶 更有纪念意义的装饰' },
          { v: 'less_shop', l: '🛍️ 更弱化商店感' },
          { v: 'scene_quality', l: '🏠 更好的空间场景感' },
          { v: 'family', l: '👥 更适合亲友共创' },
          { v: 'remove', l: '✂️ 暂时不要这条线' },
        ],
        returnHref: spiritId ? `/spirit/${spiritId}/decor` : '/dashboard',
        returnLabel: spiritId ? '回到装饰空间内测' : '回到我的纪念空间',
      }
    default:
      return {
        label: '某个体验页面',
        featureQuestion: '4. 目前最打动你的部分是什么？',
        featureOptions: [
          { v: 'photos', l: '📸 照片与回忆' },
          { v: 'status', l: '🌤️ 状态与回访感' },
          { v: 'privacy', l: '🔒 私密与分享边界' },
          { v: 'personality', l: '🎭 个性与故事' },
          { v: 'scene', l: '🏠 空间场景' },
        ],
        wantedQuestion: '5. 如果下一步只做一件事，你最想补什么？',
        wantedOptions: [
          { v: 'photos', l: '📸 更多照片与回忆整理' },
          { v: 'proactive', l: '📩 让它主动给我一些回访提醒' },
          { v: 'together', l: '👥 和家人朋友一起纪念' },
          { v: 'reminder', l: '📅 纪念日提醒' },
          { v: 'voice', l: '🎙️ 语音互动' },
        ],
        returnHref: '/dashboard',
        returnLabel: '回到我的纪念空间',
      }
  }
}

function FeedbackPageContent() {
  const searchParams = useSearchParams()
  const authFetch = useAuthFetch()
  const [answers, setAnswers] = useState<Answers>({
    who: '', feeling: '', comeback: '', feature: '', wanted: '', price: '', share: '', other: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const source = searchParams.get('source') || 'unknown'
  const spiritId = searchParams.get('spiritId') || ''
  const spiritName = searchParams.get('spiritName') || ''
  const photoCountRaw = searchParams.get('photoCount')
  const shareEnabledRaw = searchParams.get('shareEnabled')
  const parsedPhotoCount = photoCountRaw !== null && photoCountRaw !== ''
    ? Number.parseInt(photoCountRaw, 10)
    : Number.NaN
  const contextSnapshot: FeedbackContextSnapshot = {
    progressLabel: searchParams.get('progress') || '',
    nextStep: searchParams.get('nextStep') || '',
    photoCount: Number.isFinite(parsedPhotoCount) ? parsedPhotoCount : null,
    shareEnabled: shareEnabledRaw === '1' ? true : shareEnabledRaw === '0' ? false : null,
    returnReason: searchParams.get('returnReason') || '',
  }
  const sourceConfig = getFeedbackSourceConfig(source, spiritId)
  const sourceLabel = sourceConfig.label
  const contextSummary = spiritName
    ? `你正在为 ${spiritName} 的体验留下反馈。`
    : `你是从${sourceLabel}进入反馈页的。`
  const snapshotSummary = [
    contextSnapshot.progressLabel ? `纪念进展 ${contextSnapshot.progressLabel}` : null,
    typeof contextSnapshot.photoCount === 'number' ? `照片 ${contextSnapshot.photoCount} 张` : null,
    contextSnapshot.shareEnabled === true ? '当前已开启亲友分享' : null,
    contextSnapshot.shareEnabled === false ? '当前仍保持私密' : null,
    contextSnapshot.returnReason ? `回来看看的理由：${contextSnapshot.returnReason}` : null,
  ].filter((item): item is string => Boolean(item))

  const set = (key: keyof Answers, val: string) => setAnswers(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async () => {
    setSubmitError('')
    setSending(true)
    try {
      const res = await authFetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          context: {
            source,
            sourceLabel,
            spiritId: spiritId || null,
            spiritName: spiritName || null,
            snapshot: contextSnapshot,
          },
        }),
      })

      const data = await readResponsePayload(res)
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || '反馈提交失败，请稍后再试')
      }

      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '反馈提交失败，请稍后再试')
    } finally {
      setSending(false)
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <span className="text-6xl block">🕯️</span>
          <h1 className="text-2xl font-light text-stone-700">谢谢你</h1>
          <p className="text-stone-500">每一条反馈都会被认真读。</p>
          <p className="text-sm text-stone-400">尤其是你刚刚体验过的那一段路径，对我们最有价值。</p>
          <div className="flex flex-col gap-3">
            <Link href={sourceConfig.returnHref} className="inline-block rounded-full bg-amber-600 px-8 py-3 text-white">
              {sourceConfig.returnLabel}
            </Link>
            {sourceConfig.returnHref !== '/' && (
              <Link href="/" className="inline-block rounded-full border border-stone-300 px-8 py-3 text-stone-600">
                回到首页
              </Link>
            )}
          </div>
        </div>
      </main>
    )
  }

  const R = (name: keyof Answers, opts: { v: string; l: string }[]) => (
    <div className="space-y-2">
      {opts.map(o => (
        <label key={o.v} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-colors ${answers[name] === o.v ? 'bg-amber-100 border-amber-300' : 'bg-white border-stone-200'}`}>
          <input type="radio" name={name} value={o.v} checked={answers[name] === o.v} onChange={() => set(name, o.v)} className="accent-amber-600" />
          <span className="text-sm text-stone-600">{o.l}</span>
        </label>
      ))}
    </div>
  )

  const Q = (n: string, name: keyof Answers, opts: { v: string; l: string }[]) => (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-stone-600">{n}</h2>
      {R(name, opts)}
    </div>
  )

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-light text-stone-700">帮我们把 StillHere 做得更对</h1>
          <p className="text-xs text-stone-400">几分钟就好，没有标准答案。</p>
        </div>
        <div className="rounded-2xl bg-white px-5 py-4 text-sm leading-7 text-stone-500 shadow-sm">
          <p>{contextSummary}</p>
          <p className="mt-2 text-xs leading-6 text-stone-400">
            来源：{sourceLabel}
            {spiritName ? ` · 纪念对象：${spiritName}` : ''}
          </p>
          {snapshotSummary.length > 0 && (
            <p className="mt-2 text-xs leading-6 text-stone-400">
              {snapshotSummary.join(' · ')}
            </p>
          )}
          {contextSnapshot.nextStep && (
            <p className="mt-2 text-xs leading-6 text-stone-400">
              当时系统建议的下一步：{contextSnapshot.nextStep}
            </p>
          )}
          <p className="mt-2 text-xs leading-6 text-stone-400">
            这份表单会根据你刚刚走过的页面微调问题，尽量少收无关反馈。
          </p>
        </div>
        {Q('1. Who did you create a spirit for?', 'who', [
          { v: 'cat', l: '🐱 猫咪' }, { v: 'dog', l: '🐶 狗狗' }, { v: 'other_pet', l: '🐾 其他宠物' },
          { v: 'human', l: '👤 家人 / 朋友' }, { v: 'trying', l: '🔍 只是先体验一下' },
        ])}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-stone-600">2. 体验完这一段之后，你的真实感受是什么？</h2>
          <textarea value={answers.feeling} onChange={e => set('feeling', e.target.value)} placeholder="可以写感动、奇怪、尴尬、治愈、无感，什么都可以。" className="h-24 w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none" />
        </div>
        {Q('3. 你会回来继续看它、补充回忆或再使用吗？', 'comeback', [
          { v: 'often', l: '🟢 会，而且应该会比较常来' }, { v: 'occasionally', l: '🟡 偶尔会' },
          { v: 'unsure', l: '⚪ 还不确定' }, { v: 'no', l: '🔴 大概率不会' },
        ])}
        {Q(sourceConfig.featureQuestion, 'feature', sourceConfig.featureOptions)}
        {Q(sourceConfig.wantedQuestion, 'wanted', sourceConfig.wantedOptions)}
        {Q('6. 如果以后有付费版本，你更接受哪种？', 'price', [
          { v: 'free', l: '只接受免费' }, { v: 'once', l: '一次性小额付费' },
          { v: 'monthly', l: '低价订阅' }, { v: 'more', l: '如果真的有价值，可以付更多' },
        ])}
        {Q('7. 你会把它分享给经历过失去宠物的人吗？', 'share', [
          { v: 'yes', l: '✅ 会，我已经想到人了' }, { v: 'maybe', l: '🤔 也许会' }, { v: 'no', l: '❌ 大概率不会' },
        ])}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-stone-600">8. 还有什么想直接告诉我们的？</h2>
          <textarea value={answers.other} onChange={e => set('other', e.target.value)} placeholder="比如你不舒服的地方、最想删掉的功能、最想保留的瞬间。" className="h-24 w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm focus:border-amber-400 focus:outline-none" />
        </div>
        <button onClick={handleSubmit} disabled={sending} className="w-full rounded-full bg-amber-600 py-3 text-white transition-colors hover:bg-amber-700 disabled:opacity-50">
          {sending ? '提交中...' : '提交反馈'}
        </button>
        {submitError && (
          <p className="text-center text-sm text-red-500">{submitError}</p>
        )}
        <p className="text-center text-xs text-stone-400">🕯️ 它们值得被记住，你的反馈也一样。</p>
      </div>
    </main>
  )
}

function FeedbackPageFallback() {
  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center px-6">
      <div className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
        <h1 className="mt-6 text-2xl font-light text-stone-700">正在准备反馈表单</h1>
        <p className="mt-4 text-sm leading-7 text-stone-500">我们会把你刚刚所在的页面上下文一起带进来，方便后续整理反馈。</p>
      </div>
    </main>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={<FeedbackPageFallback />}>
      <FeedbackPageContent />
    </Suspense>
  )
}
