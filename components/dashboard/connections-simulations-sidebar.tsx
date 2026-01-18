"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, Sparkles, MessageSquare, CheckCircle2, XCircle, Clock, Bot, ArrowRight } from "lucide-react"
import { ConnectionDetailModal } from "./connection-detail-modal"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConnectionPreview {
  id: string
  name: string
  role: string
  avatar: string
  compatibility: number
  icebreaker: string
  status: "matched" | "connected"
  matchedAt: string
}

interface Simulation {
  id: string
  targetName: string
  targetRole: string
  targetAvatar?: string
  status: "completed" | "in_progress" | "failed"
  score?: number
  turns: number
  startedAt: string
  completedAt?: string
  messages: { agent: "A" | "B"; message: string }[]
  summary?: string
}

const MOCK_CONNECTIONS: ConnectionPreview[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "CTO @ Fintech Startup",
    avatar: "/woman-tech-executive.jpg",
    compatibility: 94,
    icebreaker: "You both built distributed systems at scale and share a passion for functional programming.",
    status: "matched",
    matchedAt: "2 hours ago",
  },
  {
    id: "2",
    name: "Chris Patel",
    role: "Angel Investor",
    avatar: "/man-investor-professional.jpg",
    compatibility: 89,
    icebreaker: "Chris has invested in 3 companies in your space and is actively looking for technical founders.",
    status: "matched",
    matchedAt: "5 hours ago",
  },
  {
    id: "3",
    name: "Julia Park",
    role: "PM @ AI Company",
    avatar: "/woman-product-manager.png",
    compatibility: 91,
    icebreaker: "You connected last week",
    status: "connected",
    matchedAt: "1 week ago",
  },
  {
    id: "4",
    name: "Marcus Reed",
    role: "Eng Lead @ Series B",
    avatar: "/man-engineering-lead.jpg",
    compatibility: 87,
    icebreaker: "Marcus is building a team and loves your open source contributions to the React ecosystem.",
    status: "matched",
    matchedAt: "1 day ago",
  },
  {
    id: "5",
    name: "Lisa Wang",
    role: "Co-founder @ Web3",
    avatar: "/woman-startup-founder.jpg",
    compatibility: 85,
    icebreaker: "Both bootstrapped companies and share views on sustainable growth.",
    status: "matched",
    matchedAt: "3 days ago",
  },
]

const MOCK_SIMULATIONS: Simulation[] = [
  {
    id: "1",
    targetName: "Sarah Chen",
    targetRole: "CTO @ Fintech Startup",
    targetAvatar: "/woman-tech-executive.jpg",
    status: "completed",
    score: 94,
    turns: 6,
    startedAt: "2 hours ago",
    completedAt: "2 hours ago",
    messages: [
      {
        agent: "A",
        message:
          "Hey Sarah! I noticed you've built distributed systems at scale. I'm working on something similar at my startup and would love to exchange notes.",
      },
      {
        agent: "B",
        message:
          "Hi! Always happy to chat about distributed systems. What kind of scale are you dealing with? I've seen some interesting patterns at Fintech companies.",
      },
      {
        agent: "A",
        message:
          "We're processing about 10M events/day across 50+ microservices. The challenge is maintaining consistency while keeping latency under 50ms.",
      },
      {
        agent: "B",
        message:
          "That's a solid challenge! Have you considered event sourcing with CQRS? We used that pattern to handle 100M+ events. Happy to share our architecture docs.",
      },
      {
        agent: "A",
        message:
          "That would be incredibly helpful! We've been debating between CQRS and a more traditional approach. Would you be open to a quick call to dive deeper?",
      },
      { agent: "B", message: "I'd love to learn more about your use case too. Let's find a time this week." },
    ],
    summary:
      "Strong mutual interest in distributed systems. Both have experience at scale. Sarah offered to share architecture docs. Recommended for follow-up.",
  },
  {
    id: "2",
    targetName: "Chris Patel",
    targetRole: "Angel Investor",
    targetAvatar: "/man-investor-professional.jpg",
    status: "completed",
    score: 89,
    turns: 6,
    startedAt: "5 hours ago",
    completedAt: "5 hours ago",
    messages: [
      {
        agent: "A",
        message:
          "Hi Chris! I saw you've invested in several B2B SaaS companies in the developer tools space. We're building something in that area.",
      },
      { agent: "B", message: "Hi! Developer tools is definitely my sweet spot. What problem are you solving?" },
      {
        agent: "A",
        message:
          "We're building an AI-powered code review platform that integrates directly into the IDE. Think real-time suggestions, not just async PR reviews.",
      },
      {
        agent: "B",
        message:
          "Interesting positioning. The IDE-first approach is smart. What's your GTM strategy? I've seen many dev tools struggle with distribution.",
      },
      {
        agent: "A",
        message:
          "We're going PLG with a generous free tier, then enterprise upsell. Already have 2K developers using the beta daily.",
      },
      {
        agent: "B",
        message:
          "Those are compelling early numbers. I'd like to hear more about your unit economics and roadmap. Let's schedule a proper intro call.",
      },
    ],
    summary:
      "Chris is actively looking to invest in developer tools. Strong interest in the product and early traction. High likelihood of investment conversation.",
  },
  {
    id: "3",
    targetName: "Marcus Reed",
    targetRole: "Eng Lead @ Series B",
    targetAvatar: "/man-engineering-lead.jpg",
    status: "in_progress",
    turns: 3,
    startedAt: "30 min ago",
    messages: [
      {
        agent: "A",
        message:
          "Hey Marcus! I saw your blog post on scaling React applications. We're facing similar challenges at our startup.",
      },
      {
        agent: "B",
        message:
          "Thanks! That post got way more traction than I expected. What specific scaling issues are you running into?",
      },
      {
        agent: "A",
        message:
          "Mainly state management across complex forms and real-time collaboration features. We're debating between Redux and Zustand.",
      },
    ],
  },
]

export function ConnectionsSimulationsSidebar() {
  const [selectedConnection, setSelectedConnection] = useState<ConnectionPreview | null>(null)
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null)
  const [activeTab, setActiveTab] = useState<"connections" | "simulations">("connections")

  const matchedConnections = MOCK_CONNECTIONS.filter((c) => c.status === "matched")
  const connectedConnections = MOCK_CONNECTIONS.filter((c) => c.status === "connected")

  const getStatusIcon = (status: Simulation["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-3 h-3 text-green-500" />
      case "in_progress":
        return <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />
      case "failed":
        return <XCircle className="w-3 h-3 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: Simulation["status"], score?: number) => {
    switch (status) {
      case "completed":
        return (
          <Badge className={score && score >= 70 ? "bg-green-500/10 text-green-500 text-xs" : "bg-muted text-muted-foreground text-xs"}>
            {score}%
          </Badge>
        )
      case "in_progress":
        return <Badge className="bg-yellow-500/10 text-yellow-500 text-xs animate-pulse">...</Badge>
      case "failed":
        return <Badge variant="secondary" className="text-xs">No</Badge>
    }
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex flex-col h-full">
          <div className="px-4 pt-4 pb-2 border-b border-border">
            <TabsList className="w-full bg-secondary/50">
              <TabsTrigger value="connections" className="flex-1 text-xs">
                Connections ({MOCK_CONNECTIONS.length})
              </TabsTrigger>
              <TabsTrigger value="simulations" className="flex-1 text-xs">
                Simulations ({MOCK_SIMULATIONS.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="connections" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="divide-y divide-border">
                {matchedConnections.map((connection) => (
                  <button
                    key={connection.id}
                    className="w-full p-3 hover:bg-secondary/30 transition-colors text-left"
                    onClick={() => setSelectedConnection(connection)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="relative shrink-0">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={connection.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {connection.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                          <Sparkles className="w-1.5 h-1.5 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-medium text-xs truncate">{connection.name}</p>
                          <Badge variant="outline" className="shrink-0 text-green-500 border-green-500/30 text-[10px] px-1">
                            {connection.compatibility}%
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{connection.role}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{connection.icebreaker}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {connectedConnections.map((connection) => (
                  <button
                    key={connection.id}
                    className="w-full p-3 hover:bg-secondary/30 transition-colors text-left"
                    onClick={() => setSelectedConnection(connection)}
                  >
                    <div className="flex items-start gap-2">
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={connection.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {connection.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-medium text-xs truncate">{connection.name}</p>
                          <Badge variant="secondary" className="shrink-0 text-[10px] px-1">
                            Connected
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{connection.role}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{connection.matchedAt}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="simulations" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="divide-y divide-border">
                {MOCK_SIMULATIONS.map((simulation) => (
                  <button
                    key={simulation.id}
                    className="w-full p-3 hover:bg-secondary/30 transition-colors text-left"
                    onClick={() => setSelectedSimulation(simulation)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="relative shrink-0">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={simulation.targetAvatar || "/placeholder.svg?height=32&width=32&query=professional headshot"}
                          />
                          <AvatarFallback className="text-xs">
                            {simulation.targetName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5">{getStatusIcon(simulation.status)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-medium text-xs truncate">{simulation.targetName}</p>
                          {getStatusBadge(simulation.status, simulation.score)}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{simulation.targetRole}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="w-2.5 h-2.5" />
                            {simulation.turns}
                          </span>
                          <span>{simulation.startedAt}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <ConnectionDetailModal connection={selectedConnection} onClose={() => setSelectedConnection(null)} />

      {/* Simulation detail dialog */}
      <Dialog open={!!selectedSimulation} onOpenChange={() => setSelectedSimulation(null)}>
        <DialogContent className="max-w-2xl bg-card border-border shadow-lg rounded-[4px] h-full w-full max-h-full sm:h-auto sm:max-h-[90vh] sm:w-auto sm:max-w-2xl flex flex-col p-0 sm:p-6 fixed inset-0 sm:inset-auto sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-none sm:rounded-[4px]">
          {selectedSimulation && (
            <>
              <div className="flex-1 overflow-y-auto px-4 pr-12 sm:pr-4 sm:px-0 pb-4 sm:pb-0">
                <DialogHeader className="pt-6 sm:pt-0">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Your Agent</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={
                            selectedSimulation.targetAvatar ||
                            "/placeholder.svg?height=40&width=40&query=professional headshot"
                          }
                        />
                        <AvatarFallback>
                          {selectedSimulation.targetName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{selectedSimulation.targetName}</p>
                        <p className="text-xs text-muted-foreground">{selectedSimulation.targetRole}</p>
                      </div>
                    </div>
                    <div className="ml-auto">{getStatusBadge(selectedSimulation.status, selectedSimulation.score)}</div>
                  </div>
                </DialogHeader>

                <ScrollArea className="max-h-[400px] pr-4 mt-4">
                  <div className="space-y-4">
                    {selectedSimulation.messages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.agent === "A" ? "" : "flex-row-reverse"}`}>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            msg.agent === "A" ? "bg-primary/20" : "bg-secondary"
                          }`}
                        >
                          {msg.agent === "A" ? (
                            <Bot className="w-4 h-4 text-primary" />
                          ) : (
                            <span className="text-xs font-medium">
                              {selectedSimulation.targetName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          )}
                        </div>
                        <div
                          className={`max-w-[80%] p-4 rounded-2xl ${
                            msg.agent === "A"
                              ? "bg-primary/10 border border-primary/20 rounded-tl-none"
                              : "bg-secondary rounded-tr-none"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                    {selectedSimulation.status === "in_progress" && (
                      <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium">
                            {selectedSimulation.targetName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="bg-secondary p-4 rounded-2xl rounded-tr-none">
                          <div className="flex gap-1">
                            <span
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            />
                            <span
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            />
                            <span
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {selectedSimulation.summary && (
                  <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-medium">AI Summary</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedSimulation.summary}</p>
                  </div>
                )}

                {selectedSimulation.status === "completed" &&
                  selectedSimulation.score &&
                  selectedSimulation.score >= 70 && (
                    <div className="flex gap-3 mt-4 pb-4 sm:pb-0">
                      <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                        Book Coffee Chat
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Save for Later
                      </Button>
                    </div>
                  )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
