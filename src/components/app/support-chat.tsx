// 'use client' required: manages open/close state, question input, message history, and API fetch.
"use client"

import { useEffect, useRef, useState } from "react"
import { HelpCircle, Loader2, Send, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface Message {
  question: string
  answer: string | null
  loading: boolean
}

interface SupportChatProps {
  isAuthenticated: boolean
}

/**
 * Floating support chat widget. Fixed to the bottom-right of every page via the root layout.
 * Renders nothing when the user is not authenticated (login/signup pages).
 * POSTs questions to /api/support and displays the agent's plain-text answers inline.
 */
export function SupportChat({ isAuthenticated }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to latest message whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (!isAuthenticated) return null

  const isLoading = messages.some((m) => m.loading)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = question.trim()
    if (!q || isLoading) return

    setQuestion("")
    setError(null)
    setMessages((prev) => [...prev, { question: q, answer: null, loading: true }])

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      })
      const data = await res.json() as { answer?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Failed to get answer")

      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, answer: data.answer ?? "", loading: false } : m
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, loading: false } : m
        )
      )
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {isOpen && (
        <div className="w-80 rounded-xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Support</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
              aria-label="Close support chat"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex max-h-72 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Ask me anything about the app — habits, streaks, goals, coaching, and more.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                {/* User question — right-aligned bubble */}
                <div className="self-end rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground max-w-[85%]">
                  {msg.question}
                </div>
                {/* Agent answer — left-aligned bubble */}
                {msg.loading ? (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking…
                  </div>
                ) : msg.answer ? (
                  <div className="rounded-lg bg-muted px-3 py-2 text-xs text-foreground max-w-[85%]">
                    {msg.answer}
                  </div>
                ) : null}
              </div>
            ))}
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question…"
              className="h-8 text-xs"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={isLoading || !question.trim()}
              aria-label="Send"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Floating toggle button */}
      <Button
        size="icon"
        className={cn("h-12 w-12 rounded-full shadow-lg")}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        {isOpen
          ? <X className="h-5 w-5" />
          : <HelpCircle className="h-5 w-5" />
        }
      </Button>
    </div>
  )
}

export default SupportChat
