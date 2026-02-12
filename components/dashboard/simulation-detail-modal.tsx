"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogClose, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Mail, Linkedin, ExternalLink, Sparkles, Target, X, Clock, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Simulation {
  id: string
  partnerId: string
  targetName: string
  targetRole: string
  targetAvatar?: string
  status: "completed" | "in_progress" | "failed"
  score?: number
  startedAt: string
  takeaways?: string[]
}

interface SimulationDetailModalProps {
  simulation: Simulation | null
  onClose: () => void
}

export function SimulationDetailModal({ simulation, onClose }: SimulationDetailModalProps) {
  const [sendingCoffeeChat, setSendingCoffeeChat] = useState(false)
  const [coffeeChatSent, setCoffeeChatSent] = useState<string | null>(null)
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null)
  const [talkingPoints, setTalkingPoints] = useState<string[]>([])
  const supabase = createClient()

  const handleReachOut = async () => {
    if (!simulation) return

    setSendingCoffeeChat(true)
    setCoffeeChatSent(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/send-coffee-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId: simulation.id, senderId: user.id })
      })

      const result = await response.json()

      if (!response.ok) {
        setCoffeeChatSent(result.error || "Failed to get contact info")
        return
      }

      const subject = encodeURIComponent(
        `Intro via Doppels: ${result.senderName} <> ${result.receiverName}`
      )
      const body = encodeURIComponent(
        `Hey ${result.receiverFirstName},\n\n` +
        `My AI agent ran a sim with yours on Doppels and flagged us as a ${result.score}% match.\n\n` +
        `TL;DR: ${result.topTakeaway}\n\n` +
        `Wanted to reach out directly — let me know if you're up for a quick chat.\n\n` +
        `${result.senderName}`
      )

      window.location.href = `mailto:${result.receiverEmail}?subject=${subject}&body=${body}`
    } catch (error) {
      setCoffeeChatSent("Failed to prepare email")
    } finally {
      setSendingCoffeeChat(false)
    }
  }

  // Reset state when simulation changes
  useEffect(() => {
    if (simulation) {
      setCoffeeChatSent(null)
      setLinkedinUrl(null)
      setTalkingPoints(simulation.takeaways || [])

      const fetchDetails = async () => {
        try {
          // Fetch the partner's LinkedIn URL
          const { data: partnerUser } = await supabase
            .from('users')
            .select('linkedin_url')
            .eq('id', simulation.partnerId)
            .single()

          if (partnerUser?.linkedin_url) {
            setLinkedinUrl(partnerUser.linkedin_url)
          }

          // If no takeaways in simulation prop, fetch from DB
          if (!simulation.takeaways?.length) {
            const { data: sim } = await supabase
              .from('simulations')
              .select('takeaways')
              .eq('id', simulation.id)
              .single()

            if (sim?.takeaways && Array.isArray(sim.takeaways)) {
              setTalkingPoints(sim.takeaways)
            }
          }
        } catch (error) {
          console.error("Error fetching details:", error)
        }
      }
      fetchDetails()
    }
  }, [simulation?.id, supabase])

  if (!simulation) return null

  const isMatch = simulation.status === "completed" && simulation.score !== undefined && simulation.score >= 70
  const isRunning = simulation.status === "in_progress"
  const isFailed = simulation.status === "failed"
  const isReviewed = simulation.status === "completed" && !isMatch

  const scores = simulation.score ? {
    relevance: Math.min(95, simulation.score + 3),
    reciprocity: Math.min(90, simulation.score - 5),
    toneMatch: Math.min(98, simulation.score + 8),
  } : null

  return (
    <Dialog
      open={!!simulation}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent showCloseButton={false} className="max-w-lg bg-card border-border shadow-lg h-[calc(100vh-3.5rem)] w-full max-h-[calc(100vh-3.5rem)] mt-14 sm:h-auto sm:max-h-[90vh] sm:w-auto sm:max-w-lg sm:mt-0 flex flex-col min-h-0 p-0 sm:p-6 rounded-lg !fixed !top-14 !left-0 !right-0 !bottom-0 sm:!inset-auto sm:!top-[50%] sm:!left-[50%] !translate-x-0 !translate-y-0 sm:!translate-x-[-50%] sm:!translate-y-[-50%] !z-[60] overflow-hidden">
        <DialogClose className="absolute top-4 right-12 sm:right-4 z-[70] rounded-sm opacity-70 hover:opacity-100 transition-opacity p-2 ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 size-8 flex items-center justify-center" aria-label="Close">
          <X className="size-4" />
        </DialogClose>
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pr-12 sm:px-0 sm:pr-6 pb-4 sm:pb-0 min-w-0" style={{ scrollbarGutter: "stable" }}>
          <DialogHeader className="pt-6 sm:pt-0 shrink-0">
            <div className="flex items-start gap-4 min-w-0">
              <div className="relative shrink-0">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={simulation.targetAvatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {simulation.targetName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {isMatch && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500 border-2 border-card flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                )}
                {isRunning && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 border-2 border-card flex items-center justify-center">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                )}
                {isFailed && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-destructive border-2 border-card flex items-center justify-center">
                    <AlertCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <DialogTitle className="text-xl truncate">{simulation.targetName}</DialogTitle>
                <DialogDescription className="text-sm truncate">{simulation.targetRole}</DialogDescription>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {isMatch && (
                    <Badge className="bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 shrink-0">
                      {simulation.score}% Match
                    </Badge>
                  )}
                  {isReviewed && simulation.score !== undefined && (
                    <Badge variant="secondary" className="shrink-0">
                      {simulation.score}%
                    </Badge>
                  )}
                  {isRunning && (
                    <Badge className="bg-yellow-500/10 text-yellow-500 shrink-0 animate-pulse">
                      Running
                    </Badge>
                  )}
                  {isFailed && (
                    <Badge variant="secondary" className="text-destructive shrink-0">
                      Failed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Running State */}
            {isRunning && (
              <div className="p-6 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-center">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Simulation in progress</p>
                <p className="text-xs text-muted-foreground">
                  Your agent is chatting with {simulation.targetName.split(" ")[0]}. Check back soon for results.
                </p>
              </div>
            )}

            {/* Failed State */}
            {isFailed && (
              <div className="p-6 rounded-lg bg-destructive/5 border border-destructive/20 text-center">
                <AlertCircle className="w-8 h-8 text-destructive/70 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">Simulation didn't complete</p>
                <p className="text-xs text-muted-foreground">
                  Something went wrong during the conversation. This can happen occasionally.
                </p>
              </div>
            )}

            {/* Compatibility Breakdown (for completed simulations with score) */}
            {(isMatch || isReviewed) && scores && (
              <div className="space-y-4 min-w-0">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Compatibility Breakdown
                </h4>
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 min-w-0">
                  <div className="space-y-1 min-w-0">
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-muted-foreground shrink-0">Relevance</span>
                      <span className="shrink-0">{scores.relevance}%</span>
                    </div>
                    <Progress value={scores.relevance} className="h-2 w-full" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-muted-foreground shrink-0">Reciprocity</span>
                      <span className="shrink-0">{scores.reciprocity}%</span>
                    </div>
                    <Progress value={scores.reciprocity} className="h-2 w-full" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex justify-between text-sm gap-2">
                      <span className="text-muted-foreground shrink-0">Tone Match</span>
                      <span className="shrink-0">{scores.toneMatch}%</span>
                    </div>
                    <Progress value={scores.toneMatch} className="h-2 w-full" />
                  </div>
                </div>
              </div>
            )}

            {/* Why you matched (for completed simulations with takeaways) */}
            {(isMatch || isReviewed) && talkingPoints.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-500" />
                  {isMatch ? "Why you matched" : "Key insights"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {talkingPoints.slice(0, 3).map((point, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm border ${
                        isMatch
                          ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions (only for matches) */}
            {isMatch && (
              <>
                {coffeeChatSent && (
                  <div className={`p-3 rounded-lg text-sm ${coffeeChatSent.includes("Failed") ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
                    {coffeeChatSent}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 min-w-0 w-full">
                  <Button
                    className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground min-w-0 shrink-0"
                    onClick={handleReachOut}
                    disabled={sendingCoffeeChat}
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{sendingCoffeeChat ? "Preparing..." : "Reach Out"}</span>
                  </Button>
                </div>
              </>
            )}

            {/* LinkedIn link (for all completed simulations) */}
            {(isMatch || isReviewed) && (
              <div className="flex items-center justify-center gap-4 pt-2 pb-4 sm:pb-0">
                {linkedinUrl ? (
                  <a
                    href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
                      <Linkedin className="w-4 h-4" />
                      View LinkedIn
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                ) : (
                  <Button variant="ghost" size="sm" className="text-muted-foreground/50 gap-2" disabled>
                    <Linkedin className="w-4 h-4" />
                    No LinkedIn
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
