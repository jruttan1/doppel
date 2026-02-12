"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sparkles, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react"
import { SimulationDetailModal } from "./simulation-detail-modal"
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

export function ConnectionsSimulationsSidebar() {
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null)
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [simulationsLoaded, setSimulationsLoaded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch all simulations (both directions - user as participant1 OR participant2)
        const { data: sims1, error: error1 } = await supabase
          .from('simulations')
          .select('id, participant1, participant2, score, status, takeaways')
          .eq('participant1', user.id)
          .order('score', { ascending: false, nullsFirst: false })
          .limit(50)

        const { data: sims2, error: error2 } = await supabase
          .from('simulations')
          .select('id, participant1, participant2, score, status, takeaways')
          .eq('participant2', user.id)
          .order('score', { ascending: false, nullsFirst: false })
          .limit(50)

        const simError = error1 || error2
        if (simError) {
          console.error("Error fetching simulations:", simError)
          setSimulations([])
          setSimulationsLoaded(true)
          return
        }

        // Normalize: always extract the "other" participant as partnerId
        const normalizedSims = [
          ...(sims1 || []).map(s => ({ ...s, partnerId: s.participant2 })),
          ...(sims2 || []).map(s => ({ ...s, partnerId: s.participant1 }))
        ]

        // Deduplicate by partner ID - keep the highest score simulation for each partner
        const seenPartners = new Set<string>()
        const simsData = normalizedSims
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .filter(s => {
            if (seenPartners.has(s.partnerId)) return false
            seenPartners.add(s.partnerId)
            return true
          })

        if (simsData.length === 0) {
          setSimulations([])
          setSimulationsLoaded(true)
          return
        }

        // Fetch user details
        const userIds = [...new Set(simsData.map(s => s.partnerId))]
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, name, tagline, persona')
          .in('id', userIds)

        if (usersError || !users) {
          setSimulationsLoaded(true)
          return
        }

        const userMap = new Map(users.map(u => [u.id, u]))

        // Build simulations list
        const simulationsList: Simulation[] = simsData.map((sim) => {
          const partnerUser = userMap.get(sim.partnerId)
          const persona = partnerUser?.persona as any
          const identity = persona?.identity || {}
          const tagline = partnerUser?.tagline || ""
          const role = identity?.role || tagline.split("@")[0]?.trim() || "Professional"
          const company = identity?.company || tagline.split("@")[1]?.split("|")[0]?.trim() || ""
          const roleText = company ? `${role} @ ${company}` : role

          const startedAt = "Just now"

          return {
            id: sim.id,
            partnerId: sim.partnerId,
            targetName: partnerUser?.name || "Unknown",
            targetRole: roleText,
            targetAvatar: undefined,
            status: (sim as any).status === 'completed' ? "completed"
              : (sim as any).status === 'failed' ? "failed"
              : (sim as any).status === 'running' ? "in_progress"
              : sim.score !== null && sim.score !== undefined ? "completed"
              : "in_progress",
            score: sim.score ?? undefined,
            startedAt,
            takeaways: (sim.takeaways as string[] | null) || [],
          }
        })

        setSimulations(simulationsList)
        setSimulationsLoaded(true)
      } catch (error) {
        setSimulationsLoaded(true)
      }
    }

    fetchData()

    // Poll for new simulations every 10 seconds
    const interval = setInterval(() => {
      fetchData()
    }, 10000)

    // Refresh when a simulation completes (small delay to ensure DB write propagates)
    const handleSimCompleted = () => setTimeout(() => fetchData(), 1000)
    window.addEventListener("simulation-completed", handleSimCompleted)

    return () => {
      clearInterval(interval)
      window.removeEventListener("simulation-completed", handleSimCompleted)
    }
  }, [supabase])

  // Group simulations by status
  const running = simulations.filter(s => s.status === "in_progress")
  const matches = simulations.filter(s => s.status === "completed" && s.score !== undefined && s.score >= 70)
  const reviewed = simulations.filter(s => s.status === "completed" && (s.score === undefined || s.score < 70))
  const failed = simulations.filter(s => s.status === "failed")

  const getStatusIcon = (status: Simulation["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3 h-3 text-teal-500" />
      case "in_progress":
        return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />
      case "failed":
        return <XCircle className="w-3 h-3 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: Simulation["status"], score?: number) => {
    switch (status) {
      case "completed":
        if (score !== undefined && score !== null) {
          return (
            <Badge className={score >= 70 ? "bg-teal-500/10 text-teal-500 text-xs" : "bg-muted text-muted-foreground text-xs"}>
              {score}%
            </Badge>
          )
        }
        return <Badge variant="secondary" className="text-xs">Done</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-500/10 text-yellow-500 text-xs animate-pulse">Running</Badge>
      case "failed":
        return <Badge variant="secondary" className="text-destructive/70 text-xs">Failed</Badge>
    }
  }

  // Show loader while initially loading
  if (!simulationsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <p className="text-sm text-muted-foreground">Loading simulations...</p>
      </div>
    )
  }

  const renderSimulationItem = (simulation: Simulation) => (
    <button
      key={simulation.id}
      type="button"
      className="w-full p-3 hover:bg-secondary/30 transition-colors text-left"
      onClick={() => setSelectedSimulation(simulation)}
    >
      <div className="flex items-start gap-2">
        <div className="relative shrink-0">
          <Avatar className="w-8 h-8">
            <AvatarImage src={simulation.targetAvatar || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">
              {simulation.targetName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5">
            {getStatusIcon(simulation.status)}
          </div>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="font-medium text-xs truncate min-w-0">{simulation.targetName}</p>
            {getStatusBadge(simulation.status, simulation.score)}
          </div>
          <p className="text-[10px] text-muted-foreground line-clamp-2 break-words">{simulation.targetRole}</p>
        </div>
      </div>
    </button>
  )

  const renderSection = (title: string, icon: React.ReactNode, items: Simulation[]) => {
    if (items.length === 0) return null
    return (
      <div className="mb-2">
        <div className="px-3 py-2 flex items-center gap-2 text-xs font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          {icon}
          <span>{title}</span>
          <span className="text-muted-foreground/60">({items.length})</span>
        </div>
        <div className="divide-y divide-border">
          {items.map(renderSimulationItem)}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="px-4 pt-4 pb-2 border-b border-border">
          <h2 className="text-sm font-medium">Simulations ({simulations.length})</h2>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="pb-4">
            {simulations.length === 0 && (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">No simulations yet</p>
                <p className="text-xs text-muted-foreground max-w-50">
                  Your agent will start networking with others automatically.
                </p>
              </div>
            )}

            {renderSection(
              "Running",
              <Clock className="w-3.5 h-3.5 text-yellow-500" />,
              running
            )}

            {renderSection(
              "Matches",
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />,
              matches
            )}

            {renderSection(
              "Reviewed",
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />,
              reviewed
            )}

            {renderSection(
              "Failed",
              <XCircle className="w-3.5 h-3.5 text-destructive/70" />,
              failed
            )}
          </div>
        </ScrollArea>
      </div>

      <SimulationDetailModal
        simulation={selectedSimulation}
        onClose={() => setSelectedSimulation(null)}
      />
    </>
  )
}
