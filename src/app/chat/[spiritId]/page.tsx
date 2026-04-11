'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'

import ChatHeader from '@/components/chat/ChatHeader'
import MessageBubble from '@/components/chat/MessageBubble'
import ChatInput from '@/components/chat/ChatInput'
import { useAuthFetch } from '@/lib/use-auth-fetch'
import { LoginButton } from '@/components/LoginButton'
import { AuthLoadingState } from '@/components/AuthLoadingState'
import { FeedbackPromptCard } from '@/components/FeedbackPromptCard'
import { readResponsePayload } from '@/lib/read-response-payload'

type ChatMessage = {
  id: string
  content: string
  role: 'user' | 'spirit'
  timestamp: string
}

const formatTime = () =>
  new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date())

function getGreeting(name?: string, tags?: string[]): string {
  if (!tags || tags.length === 0) return '你来啦！我好想你~'
  const greetings: Record<string, string[]> = {
    '粘人': [`你终于来了！我等了好久好久`, `你怎么才来呀，我一直在门口等你`],
    '贪吃': [`你来啦！有没有带好吃的~`, `闻到你的味道了！是不是带了零食？`],
    '好奇': [`你来啦！我今天发现了一个好玩的地方`, `快来快来，我有新发现要告诉你！`],
    '胆小': [`你来了...太好了，我刚才有点害怕`, `你在呀，那我就放心了`],
    '调皮': [`嘿嘿，你来得正好，我刚干了件"好事"`, `哼哼，猜猜我今天又搞了什么`],
    '安静': [`...你来了`, `嗯，坐吧`],
    '活泼': [`哇你来啦！！今天好开心！`, `来了来了！我们玩什么？`],
    '温柔': [`你来了呀，今天过得好吗？`, `看到你真好，坐下来陪我一会儿吧`],
    '独立': [`哦，你来了`, `嗯，正好我也闲着`],
    '霸道': [`哼，终于想起我了？`, `你怎么现在才来！`],
  }
  for (const tag of tags) {
    if (greetings[tag]) {
      return greetings[tag][Math.floor(Math.random() * greetings[tag].length)]
    }
  }
  return '你来啦！我好想你~'
}

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

interface SpiritInfo {
  name: string
  spiritType: string
  tags?: string[]
}

export default function ChatPage({ params }: { params: { spiritId: string } }) {
  const router = useRouter()
  const { ready, authenticated } = usePrivy()
  const authFetch = useAuthFetch()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [spiritInfo, setSpiritInfo] = useState<SpiritInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [pageError, setPageError] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  const spiritId = params.spiritId

  // 加载分身信息和聊天历史
  useEffect(() => {
    setLoading(true)
    setPageError('')

    if (!ready) return

    if (!authenticated) {
      setLoading(false)
      return
    }

    Promise.all([
      authFetch(`/api/spirit?id=${spiritId}`),
      authFetch(`/api/chat?spiritId=${spiritId}`),
    ])
      .then(async ([spiritRes, chatRes]) => {
        const spiritData = await readResponsePayload(spiritRes)
        const chatData = await readResponsePayload(chatRes)

        if (!spiritRes.ok || !(spiritData as { spirit?: { name?: string } }).spirit) {
          throw new Error((spiritData as { error?: string }).error || '找不到这个纪念空间')
        }
        if (!chatRes.ok) {
          throw new Error((chatData as { error?: string }).error || '纪念对话暂时不可用')
        }

        const spiritPayload = (spiritData as {
          spirit: { name: string; spiritType: string; personality?: { tags?: string[] } }
        }).spirit
        const personality = spiritPayload.personality as { tags?: string[] } | null
        if (spiritPayload) {
          setSpiritInfo({ name: spiritPayload.name, spiritType: spiritPayload.spiritType, tags: personality?.tags })
        }
        if ((chatData as { messages?: Array<{ id: string; role: string; content: string; createdAt: string }> }).messages?.length) {
          setMessages((chatData as { messages: Array<{ id: string; role: string; content: string; createdAt: string }> }).messages.map((m) => ({
            id: m.id,
            content: m.content,
            role: m.role === 'spirit' ? 'spirit' : 'user',
            timestamp: new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date(m.createdAt)),
          })))
        } else {
          setMessages([{
            id: createId(),
            content: getGreeting(spiritPayload.name, personality?.tags),
            role: 'spirit',
            timestamp: formatTime(),
          }])
        }
      })
      .catch((error) => {
        console.error(error)
        setSpiritInfo(null)
        setMessages([])
        setPageError(error instanceof Error ? error.message : '纪念对话暂时不可用')
      })
      .finally(() => setLoading(false))
  }, [ready, authenticated, authFetch, spiritId])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

  if (!ready) {
    return (
      <AuthLoadingState
        title="正在准备纪念对话"
        body="我们正在确认登录状态和访问权限。要是这里停留太久，通常是登录服务还没完全就绪。"
      />
    )
  }

  const handleSend = async (message: string) => {
    if (sending) return
    setMessages(prev => [...prev, {
      id: createId(),
      content: message,
      role: 'user',
      timestamp: formatTime(),
    }])

    setSending(true)
    try {
      const res = await authFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spiritId, content: message }),
      })

      const contentType = res.headers.get('content-type') || ''

      if (!res.ok && !contentType.includes('text/event-stream')) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || '发送失败')
      }

      if (contentType.includes('text/event-stream')) {
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let replyText = ''
        const replyId = createId()

        setMessages(prev => [...prev, {
          id: replyId,
          content: '',
          role: 'spirit',
          timestamp: formatTime(),
        }])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.text) {
                  replyText += data.text
                  const currentText = replyText
                  setMessages(prev => prev.map(m =>
                    m.id === replyId ? { ...m, content: currentText } : m
                  ))
                }
              } catch { /* ignore */ }
            }
          }
        }
      } else {
        const data = await res.json()
        if (data.message) {
          setMessages(prev => [...prev, {
            id: createId(),
            content: data.message,
            role: 'spirit',
            timestamp: formatTime(),
          }])
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        id: createId(),
        content: '这段纪念对话暂时不可用，请稍后再试。',
        role: 'spirit',
        timestamp: formatTime(),
      }])
    } finally {
      setSending(false)
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-amber-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-light text-stone-700">登录后查看纪念对话</h1>
          <p className="mt-4 text-sm leading-7 text-stone-500">
            聊天能力当前仍是探索线，只对纪念空间创建者开放，用来验证回访时的轻量陪伴感。
          </p>
          <div className="mt-8">
            <LoginButton
              label="登录并继续"
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-sm text-stone-400">正在打开纪念对话...</span>
        </div>
      </main>
    )
  }

  if (!spiritInfo) {
    return (
      <main className="min-h-screen bg-amber-50 px-6 py-12">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-light text-stone-700">暂时无法进入纪念对话</h1>
          <p className="mt-4 text-sm leading-7 text-stone-500">
            {pageError || '你可能还没有这个纪念空间的查看权限。'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <main className="min-h-screen bg-amber-50">
        <div className="mx-auto flex h-screen max-w-md flex-col">
          <ChatHeader
            name={spiritInfo?.name || ''}
            spiritType={spiritInfo?.spiritType}
            onBack={() => router.back()}
          />
          <div className="mx-4 mt-3 rounded-2xl bg-white/80 px-4 py-3 text-xs leading-6 text-stone-500 shadow-sm">
            这是探索中的纪念对话，只服务你和它之间的回访，不承诺数字复活，也不会替代你留下的真实回忆。
          </div>
          <div className="mx-4 mt-3">
            <FeedbackPromptCard
              href={`/feedback?source=memorial_chat&spiritId=${encodeURIComponent(spiritId)}&spiritName=${encodeURIComponent(spiritInfo.name)}`}
              title="这段纪念对话感觉对吗？"
              body="如果它让你觉得温柔、别扭、越界、没必要，或者你有更想要的互动方式，都欢迎直接说。"
              cta="反馈纪念对话"
            />
          </div>
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
            {messages.map(message => (
              <MessageBubble key={message.id} {...message} spiritType={spiritInfo?.spiritType} />
            ))}
          </div>
          <ChatInput onSend={handleSend} placeholder="说点什么..." />
        </div>
      </main>
    </>
  )
}
