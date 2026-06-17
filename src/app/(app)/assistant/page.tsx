import { ChatInterface } from '@/components/assistant/chat-interface'

export const metadata = {
  title: 'AI Assistant — Cresco',
  description: 'Chat with your personal AI finance assistant',
}

export default function AssistantPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">AI Finance Assistant</h2>
        <p className="text-muted-foreground text-sm">Ask anything about your money. I use your real data.</p>
      </div>
      <ChatInterface />
    </div>
  )
}
