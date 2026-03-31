'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import ChatHeader from '@/components/chat/ChatHeader'
import MessageBubble from '@/components/chat/MessageBubble'
import ChatInput from '@/components/chat/ChatInput'

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
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [spiritInfo, setSpiritInfo] = useState<SpiritInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  const spiritId = params.spiritId

  // 加载分身信息和聊天历史
  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(`/api/spirit?id=${spiritId}`).then(r => r.json()),
      fetch(`/api/chat?spiritId=${spiritId}`).then(r => r.json()),
    ])
      .then(([spiritData, chatData]) => {
        const personality = spiritData.spirit?.personality as { tags?: string[] } | null
        if (spiritData.spirit) {
          setSpiritInfo({ name: spiritData.spirit.name, spiritType: spiritData.spirit.spiritType, tags: personality?.tags })
        }
        if (chatData.messages && chatData.messages.length > 0) {
          setMessages(chatData.messages.map((m: { id: string; role: string; content: string; createdAt: string }) => ({
            id: m.id,
            content: m.content,
            role: m.role === 'spirit' ? 'spirit' : 'user',
            timestamp: new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(new Date(m.createdAt)),
          })))
        } else {
          setMessages([{
            id: createId(),
            content: getGreeting(spiritData.spirit?.name, personality?.tags),
            role: 'spirit',
            timestamp: formatTime(),
          }])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [spiritId])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages])

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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spiritId, content: message }),
      })

      const contentType = res.headers.get('content-type') || ''

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
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-sm text-stone-400">正在连接彼岸世界...</span>
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
