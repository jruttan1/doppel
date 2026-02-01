"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, MessageSquare, Zap, BarChart3 } from "lucide-react"

interface TranscriptMessage {
  speaker: string
  id: string
  text: string
  timestamp: string
}

interface LogEntry {
  type: "connect" | "agent" | "partner" | "analyzing" | "result"
  label: string
  text: string
}

interface AgentFeedProps {
  simulationId: string
  partnerName: string
  currentUserName: string
  onComplete: (score: number) => void
}

const STALL_TIMEOUT = 180_000 // 3 minutes

export function AgentFeed({ simulationId, partnerName, currentUserName, onComplete }: AgentFeedProps) {
  const [messages, setMessages] = useState<TranscriptMessage[]>([])
  const [status, setStatus] = useState<"running" | "completed" | "failed">("running")
  const [score, setScore] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)
  const supabase = createClient()

  const handleComplete = useCallback((s: number) => {
    if (completedRef.current) return
    completedRef.current = true
    setScore(s)
    setStatus("completed")
    onComplete(s)
  }, [onComplete])

  useEffect(() => {
    completedRef.current = false

    const fetchInitial = async () => {
      const { data } = await supabase
        .from("simulations")
        .select("transcript, score, status")
        .eq("id", simulationId)
        .single()

      if (data) {
        setMessages(data.transcript || [])
        if (data.status === "completed" && data.score !== null && data.score !== undefined) {
          handleComplete(data.score)
        } else if (data.status === "failed") {
          handleComplete(0)
        }
      }
    }
    fetchInitial()

    const channel = supabase
      .channel(`simulation-${simulationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "simulations",
          filter: `id=eq.${simulationId}`,
        },
        (payload) => {
          const row = payload.new as any
          if (row.transcript) {
            setMessages(row.transcript)
          }
          if (row.status === "completed" && row.score !== null && row.score !== undefined) {
            handleComplete(row.score)
          } else if (row.status === "failed") {
            handleComplete(0)
          }
        }
      )
      .subscribe()

    const timeout = setTimeout(() => {
      if (!completedRef.current) {
        handleComplete(0)
      }
    }, STALL_TIMEOUT)

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(timeout)
    }
  }, [simulationId, supabase, handleComplete])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, status])

  // Build log entries from transcript messages
  const logEntries: LogEntry[] = []

  // Opening entry
  logEntries.push({
    type: "connect",
    label: "Connecting",
    text: `Reaching out to ${partnerName}...`,
  })

  // Map messages to log entries
  messages.forEach((msg, i) => {
    const isAgent = i % 2 === 0
    const excerpt = msg.text.length > 100 ? msg.text.slice(0, 100) + "..." : msg.text
    logEntries.push({
      type: isAgent ? "agent" : "partner",
      label: isAgent ? "Your Agent" : partnerName,
      text: excerpt,
    })
  })

  // Completion entries
  if (status === "completed" && score !== null) {
    logEntries.push({
      type: "analyzing",
      label: "Analyzing",
      text: "Evaluating compatibility...",
    })
    logEntries.push({
      type: "result",
      label: "Result",
      text: score >= 70 ? `Score: ${score}% — Match!` : `Score: ${score}%`,
    })
  }

  const getIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "connect":
        return <Zap className="w-3 h-3 text-blue-400 shrink-0" />
      case "agent":
        return <MessageSquare className="w-3 h-3 text-teal-500 shrink-0" />
      case "partner":
        return <MessageSquare className="w-3 h-3 text-muted-foreground shrink-0" />
      case "analyzing":
        return <BarChart3 className="w-3 h-3 text-amber-400 shrink-0" />
      case "result":
        return <CheckCircle2 className="w-3 h-3 text-teal-500 shrink-0" />
    }
  }

  return (
    <div className="h-full flex flex-col rounded-lg border border-border bg-background/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/30 flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{currentUserName}</span>
          <span className="opacity-40">&rarr;</span>
          <span className="font-medium text-foreground">{partnerName}</span>
        </div>
        {status === "running" ? (
          <Badge className="bg-blue-500/10 text-blue-500 text-[10px] animate-pulse">Live</Badge>
        ) : score !== null ? (
          <Badge className={score >= 70 ? "bg-teal-500/10 text-teal-500 text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
            {score}%
          </Badge>
        ) : null}
      </div>

      {/* Activity log */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
        <div className="space-y-1.5">
          {logEntries.map((entry, i) => (
            <div
              key={i}
              className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300"
              style={{ animationDelay: `${Math.min(i * 50, 300)}ms`, animationFillMode: "backwards" }}
            >
              <div className="mt-0.5">{getIcon(entry.type)}</div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-semibold text-foreground">{entry.label}</span>
                <span className="text-[11px] text-muted-foreground ml-1.5 break-words">{entry.text}</span>
              </div>
            </div>
          ))}

          {/* Running indicator */}
          {status === "running" && (
            <div className="flex items-center gap-2 pt-1">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
              </span>
              <span className="text-[10px] text-muted-foreground">Processing...</span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>
    </div>
  )
}
