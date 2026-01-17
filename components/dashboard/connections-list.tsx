"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, Sparkles } from "lucide-react"
import { ConnectionDetailModal } from "./connection-detail-modal"

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

export function ConnectionsList() {
  const [selectedConnection, setSelectedConnection] = useState<ConnectionPreview | null>(null)

  const matchedConnections = MOCK_CONNECTIONS.filter((c) => c.status === "matched")
  const connectedConnections = MOCK_CONNECTIONS.filter((c) => c.status === "connected")

  return (
    <>
      <Card className="bg-card border-border h-full shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Your Connections</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="matches" className="w-full">
            <div className="px-6">
              <TabsList className="w-full bg-secondary/50">
                <TabsTrigger value="matches" className="flex-1">
                  Matches ({matchedConnections.length})
                </TabsTrigger>
                <TabsTrigger value="connected" className="flex-1">
                  Connected ({connectedConnections.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="matches" className="mt-0">
              <div className="divide-y divide-border">
                {matchedConnections.map((connection) => (
                  <button
                    key={connection.id}
                    className="w-full p-4 hover:bg-secondary/30 transition-colors text-left"
                    onClick={() => setSelectedConnection(connection)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={connection.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {connection.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                          <Sparkles className="w-2 h-2 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">{connection.name}</p>
                          <Badge variant="outline" className="shrink-0 text-green-500 border-green-500/30 text-xs">
                            {connection.compatibility}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{connection.role}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{connection.icebreaker}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="connected" className="mt-0">
              <div className="divide-y divide-border">
                {connectedConnections.map((connection) => (
                  <button
                    key={connection.id}
                    className="w-full p-4 hover:bg-secondary/30 transition-colors text-left"
                    onClick={() => setSelectedConnection(connection)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={connection.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {connection.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">{connection.name}</p>
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            Connected
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{connection.role}</p>
                        <p className="text-xs text-muted-foreground mt-1">{connection.matchedAt}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ConnectionDetailModal connection={selectedConnection} onClose={() => setSelectedConnection(null)} />
    </>
  )
}
