"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, MessageCircle, Linkedin, ExternalLink, Sparkles, Target, Users, MessageSquare, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ConnectionPreview {
  id: string
  name: string
  role: string
  avatar: string
  compatibility: number
  icebreaker: string
  status: "matched" | "connected"
  matchedAt: string
  simulationId?: string
}

interface ConnectionDetailModalProps {
  connection: ConnectionPreview | null
  onClose: () => void
  onViewSimulation?: (simulationId: string) => void
}

export function ConnectionDetailModal({ connection, onClose, onViewSimulation }: ConnectionDetailModalProps) {
  const [simulationId, setSimulationId] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<Array<{ speaker: string; text: string; id: string }>>([])
  const [talkingPoints, setTalkingPoints] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentUserName, setCurrentUserName] = useState<string>("You")
  const [sendingCoffeeChat, setSendingCoffeeChat] = useState(false)
  const [coffeeChatSent, setCoffeeChatSent] = useState<string | null>(null)
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null)
  const supabase = createClient()

  const handleBookCoffeeChat = async () => {
    const simId = connection?.simulationId || simulationId
    console.log("Coffee chat - connection.simulationId:", connection?.simulationId, "simulationId state:", simulationId, "using:", simId)
    
    if (!simId) {
      console.error("No simulation ID available")
      setCoffeeChatSent("No simulation found for this connection")
      return
    }

    setSendingCoffeeChat(true)
    setCoffeeChatSent(null)
    
    // Show toast after 1.5 seconds
    setTimeout(() => {
      toast.success("Email sent!", {
        description: "Coffee chat invitation has been sent.",
        duration: 3000,
      })
    }, 1500)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error("No user found")
        return
      }

      console.log("Sending coffee chat request with simId:", simId, "senderId:", user.id)
      
      const response = await fetch('/api/send-coffee-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationId: simId,
          senderId: user.id
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setCoffeeChatSent(result.message || "Invitation sent!")
      } else {
        console.error("Failed to send:", result.error)
        setCoffeeChatSent("Failed to send invitation")
      }
    } catch (error) {
      console.error("Error sending coffee chat:", error)
      setCoffeeChatSent("Failed to send invitation")
    } finally {
      setSendingCoffeeChat(false)
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: currentUser } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.id)
          .single()
        
        if (currentUser?.name) {
          setCurrentUserName(currentUser.name)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [supabase])

  // Reset state when connection changes
  useEffect(() => {
    if (connection) {
      // Reset all state when a new connection is opened
      setSimulationId(null)
      setMessages([])
      setTalkingPoints([])
      setShowChat(false)
      setCoffeeChatSent(null)
      setLinkedinUrl(null)
      
      // Find the simulation and connection's LinkedIn URL
      const findSimulation = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return

          console.log("Finding simulation for user:", user.id, "connection:", connection.id)

          // Fetch the connection's LinkedIn URL
          const { data: connectionUser } = await supabase
            .from('users')
            .select('linkedin_url')
            .eq('id', connection.id)
            .single()

          if (connectionUser?.linkedin_url) {
            setLinkedinUrl(connectionUser.linkedin_url)
          }

          // Try to find simulation where current user is participant1
          let { data: sim, error } = await supabase
            .from('simulations')
            .select('id, transcript, takeaways')
            .eq('participant1', user.id)
            .eq('participant2', connection.id)
            .order('score', { ascending: false })
            .limit(1)
            .maybeSingle()

          // If not found, try reverse order (current user might be participant2)
          if (!sim) {
            const { data: simReverse } = await supabase
              .from('simulations')
              .select('id, transcript, takeaways')
              .eq('participant1', connection.id)
              .eq('participant2', user.id)
              .order('score', { ascending: false })
              .limit(1)
              .maybeSingle()
            sim = simReverse
          }

          console.log("Found simulation:", sim?.id)

          if (sim) {
            setSimulationId(sim.id)
            if (sim.transcript && Array.isArray(sim.transcript)) {
              setMessages(sim.transcript as any[])
            }
            if (sim.takeaways && Array.isArray(sim.takeaways)) {
              setTalkingPoints(sim.takeaways)
            } else {
              setTalkingPoints([])
            }
          } else {
            console.log("No simulation found between these users")
          }
        } catch (error) {
          console.error("Error finding simulation:", error)
        }
      }
      findSimulation()
    }
  }, [connection?.id, supabase]) // Use connection.id to detect changes

  const handleViewSimulation = async () => {
    console.log("handleViewSimulation called", { 
      connection: connection?.id, 
      simulationId, 
      connectionSimulationId: connection?.simulationId,
      hasOnViewSimulation: !!onViewSimulation 
    })
    
    if (!connection) {
      console.warn("No connection available")
      return
    }
    
    if (!onViewSimulation) {
      console.warn("onViewSimulation callback not provided")
      return
    }
    
    setIsLoading(true)
    
    try {
      // Use simulationId from connection if available, otherwise use the one we fetched
      let simId = connection.simulationId || simulationId
      console.log("Initial simId:", simId)
      
      // If we don't have a simulation ID, fetch it from the database
      if (!simId && connection.id) {
        console.log("Fetching simulation ID from database...")
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.warn("No user found")
          setIsLoading(false)
          return
        }

        const { data: sim, error } = await supabase
          .from('simulations')
          .select('id')
          .eq('participant1', user.id)
          .eq('participant2', connection.id)
          .order('score', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) {
          console.error("Error fetching simulation:", error)
          setIsLoading(false)
          return
        }

        if (sim) {
          simId = sim.id
          console.log("Found simulation ID:", simId)
        } else {
          console.warn("No simulation found for connection:", connection.id)
          setIsLoading(false)
          return
        }
      }
      
      // Directly route to the simulation
      if (simId) {
        console.log("Calling onViewSimulation with simId:", simId)
        // onViewSimulation will set selectedConnection to null, which closes this modal
        // Do NOT call onClose() here - it would clear the simulation we're about to show
        await onViewSimulation(simId)
      } else {
        console.warn("No simulation ID found")
      }
    } catch (error) {
      console.error("Error in handleViewSimulation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!connection) return null

  const scores = {
    relevance: Math.min(95, connection.compatibility + 3),
    reciprocity: Math.min(90, connection.compatibility - 5),
    toneMatch: Math.min(98, connection.compatibility + 8),
  }

  return (
    <Dialog 
      open={!!connection} 
      onOpenChange={(open) => {
        console.log("Connection dialog onOpenChange:", open, connection?.id)
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-lg bg-card border-border shadow-lg h-[calc(100vh-3.5rem)] w-full max-h-[calc(100vh-3.5rem)] mt-14 sm:h-auto sm:max-h-[90vh] sm:w-auto sm:max-w-lg sm:mt-0 flex flex-col p-0 sm:p-6 rounded-lg !fixed !top-14 !left-0 !right-0 !bottom-0 sm:!inset-auto sm:!top-[50%] sm:!left-[50%] !translate-x-0 !translate-y-0 sm:!translate-x-[-50%] sm:!translate-y-[-50%] !z-[60] overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 sm:px-0 pb-4 sm:pb-0 min-w-0">
          <DialogHeader className="pt-6 sm:pt-0">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={connection.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {connection.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-500 border-2 border-card flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">{connection.name}</DialogTitle>
                <DialogDescription className="text-sm">{connection.role}</DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-teal-500/10 text-teal-500 hover:bg-teal-500/20">
                    {connection.compatibility}% Match
                  </Badge>
                  <span className="text-xs text-muted-foreground">{connection.matchedAt}</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
          {/* Compatibility Breakdown */}
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

          {/* Icebreaker */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Your Icebreaker
            </h4>
            <p className="text-sm text-muted-foreground">{connection.icebreaker}</p>
          </div>

          {/* Talking Points */}
          {talkingPoints.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Talking Points
              </h4>
              <ul className="space-y-2">
                {talkingPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          {coffeeChatSent && (
            <div className={`p-3 rounded-lg text-sm ${coffeeChatSent.includes("Failed") ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
              {coffeeChatSent}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 min-w-0 w-full">
            <Button 
              className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground min-w-0 shrink-0"
              onClick={handleBookCoffeeChat}
              disabled={sendingCoffeeChat || coffeeChatSent?.includes("sent")}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="truncate">{sendingCoffeeChat ? "Sending..." : coffeeChatSent?.includes("sent") ? "Invitation Sent!" : "Book Coffee Chat"}</span>
            </Button>
            <Button 
              type="button"
              variant="outline" 
              className="flex-1 gap-2 bg-transparent min-w-0 shrink-0"
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                await handleViewSimulation()
              }}
              disabled={isLoading}
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="truncate">{isLoading ? "Loading..." : "View Simulation"}</span>
            </Button>
          </div>

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

          {/* Chat View */}
          {showChat && messages.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                        {currentUserName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">Your Agent</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={connection.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {connection.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{connection.name}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChat(false)}
                  className="text-xs"
                >
                  Hide Chat
                </Button>
              </div>

              <ScrollArea className="h-[350px] pr-2">
                <div className="space-y-3">
                  {messages.map((msg, i) => {
                    const isMyAgent = i % 2 === 0
                    return (
                      <div key={i} className={`flex gap-2.5 ${isMyAgent ? "" : "flex-row-reverse"}`}>
                        <div className="shrink-0">
                          {isMyAgent ? (
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-semibold">
                                {currentUserName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="text-[10px]">
                                {connection.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <div
                          className={`max-w-[75%] p-3 rounded-xl ${
                            isMyAgent
                              ? "bg-primary/10 border border-primary/20 rounded-tl-none"
                              : "bg-secondary rounded-tr-none"
                          }`}
                        >
                          <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">{msg.text || ""}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
