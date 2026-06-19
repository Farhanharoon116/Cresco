'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Send, Sparkles, User, Bot, Loader2, Copy, Check, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AI_SUGGESTED_PROMPTS } from '@/lib/constants'
import { toast } from 'sonner'
import type { ChatMessage } from '@/types/ai'

function generateId() { return `msg_${Date.now()}_${Math.random().toString(36).slice(2)}` }

const SESSION_KEY = 'cresco_chat_history'
const MAX_HISTORY = 20

// Simple markdown renderer for bold, bullets, numbered lists
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-sm font-bold text-foreground mt-2 mb-1">{line.slice(4)}</h3>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-sm font-black text-foreground mt-2 mb-1">{line.slice(3)}</h2>)
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      const items = [line.slice(2)]
      let j = i + 1
      while (j < lines.length && (lines[j].startsWith('- ') || lines[j].startsWith('• '))) {
        items.push(lines[j].slice(2))
        j++
      }
      elements.push(
        <ul key={i} className="space-y-1 my-1.5 ml-1">
          {items.map((item, k) => (
            <li key={k} className="flex gap-2 text-sm">
              <span className="text-primary mt-0.5 flex-shrink-0 font-bold">•</span>
              <span dangerouslySetInnerHTML={{ __html: applyInlineMarkdown(item) }} />
            </li>
          ))}
        </ul>
      )
      i = j - 1
    } else if (/^\d+\.\s/.test(line)) {
      const items = [line.replace(/^\d+\.\s/, '')]
      let j = i + 1
      while (j < lines.length && /^\d+\.\s/.test(lines[j])) {
        items.push(lines[j].replace(/^\d+\.\s/, ''))
        j++
      }
      elements.push(
        <ol key={i} className="space-y-1 my-1.5 ml-1 list-decimal list-inside">
          {items.map((item, k) => (
            <li key={k} className="text-sm">
              <span dangerouslySetInnerHTML={{ __html: applyInlineMarkdown(item) }} />
            </li>
          ))}
        </ol>
      )
      i = j - 1
    } else if (line === '') {
      if (elements.length > 0) elements.push(<div key={i} className="h-1.5" />)
    } else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: applyInlineMarkdown(line) }}
        />
      )
    }
    i++
  }

  return <div className="space-y-0.5">{elements}</div>
}

function applyInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
}

const FOLLOW_UP_PROMPTS = [
  'What should I cut first?',
  'Give me a weekly budget plan',
  'How much can I save this month?',
  'What are my biggest spending risks?',
]

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[]
        setMessages(parsed.slice(-MAX_HISTORY))
      }
    } catch {}
  }, [])

  // Save to localStorage on message change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)))
      } catch {}
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: text, timestamp: new Date().toISOString() }
    const assistantMsg: ChatMessage = { id: generateId(), role: 'assistant', content: '', timestamp: new Date().toISOString(), isStreaming: true }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })

      if (!res.ok) throw new Error('Chat failed')
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        setMessages((prev) => prev.map((m) => m.id === assistantMsg.id ? { ...m, content: fullText } : m))
      }

      setMessages((prev) => prev.map((m) => m.id === assistantMsg.id ? { ...m, isStreaming: false } : m))
    } catch {
      setMessages((prev) => prev.map((m) =>
        m.id === assistantMsg.id
          ? { ...m, content: 'Sorry, I could not process that. Please try again.', isStreaming: false }
          : m
      ))
    } finally {
      setLoading(false)
    }
  }

  function copyMessage(content: string, id: string) {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success('Copied!')
  }

  function clearSession() {
    setMessages([])
    localStorage.removeItem(SESSION_KEY)
    toast.success('Chat history cleared')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const lastAssistantMsg = messages.filter((m) => m.role === 'assistant' && !m.isStreaming).pop()

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 neon-glow-sm"
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <div>
              <h3 className="text-xl font-black mb-2 tracking-tight">AI Finance Co-Pilot</h3>
              <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                Ask me anything about your finances. I have access to your real spending data and can give personalized advice.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {AI_SUGGESTED_PROMPTS.slice(0, 6).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-2 text-xs rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left font-medium text-muted-foreground hover:text-foreground"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-primary/20 border border-primary/30 flex-shrink-0 mt-1">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}

                <div className={`max-w-[78%] group ${msg.role === 'user' ? 'order-1' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-card border border-border rounded-tl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="text-foreground">
                        {renderMarkdown(msg.content)}
                        {msg.isStreaming && (
                          <span className="inline-block w-1 h-4 bg-primary ml-0.5 animate-pulse rounded-full" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Copy button for assistant messages */}
                  {msg.role === 'assistant' && !msg.isStreaming && msg.content && (
                    <button
                      onClick={() => copyMessage(msg.content, msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1"
                    >
                      {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedId === msg.id ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-muted border border-border flex-shrink-0 mt-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Follow-up suggestions */}
      {lastAssistantMsg && !loading && (
        <div className="flex gap-2 flex-wrap mb-3">
          {FOLLOW_UP_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground font-medium"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/60 pt-4">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances... (Enter to send, Shift+Enter for newline)"
            rows={2}
            className="resize-none flex-1"
            disabled={loading}
          />
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            <Button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              size="icon"
              className="h-9 w-9 rounded-xl"
              id="chat-send-btn"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSession}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive"
                title="Clear history"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[10px] text-muted-foreground">
            Powered by AI · Real financial data · Not financial advice
          </p>
          {messages.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {messages.length} messages · session saved
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
