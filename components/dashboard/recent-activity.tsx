"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle2, XCircle, MessageSquare, UserPlus, Zap } from "lucide-react"

interface ActivityItem {
  id: string
  type: "simulation_complete" | "match_found" | "connection_made" | "simulation_failed" | "agent_update"
  title: string
  description: string
  time: string
}

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "1",
    type: "match_found",
    title: "New High Match",
    description: "94% compatibility with Sarah Chen (CTO)",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "simulation_complete",
    title: "Simulation Complete",
    description: "Conversation with David Kim finished",
    time: "15 min ago",
  },
  {
    id: "3",
    type: "connection_made",
    title: "Coffee Chat Booked",
    description: "Meeting with Julia Park on Friday",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "simulation_failed",
    title: "Low Compatibility",
    description: "45% match with Tom Brown - filtered out",
    time: "2 hours ago",
  },
  {
    id: "5",
    type: "agent_update",
    title: "Agent Optimized",
    description: "Your Doppel learned from 12 new interactions",
    time: "3 hours ago",
  },
]

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "match_found":
      return <Zap className="w-4 h-4 text-green-500" />
    case "simulation_complete":
      return <MessageSquare className="w-4 h-4 text-primary" />
    case "connection_made":
      return <UserPlus className="w-4 h-4 text-purple-500" />
    case "simulation_failed":
      return <XCircle className="w-4 h-4 text-muted-foreground" />
    case "agent_update":
      return <CheckCircle2 className="w-4 h-4 text-yellow-500" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

const getActivityBadge = (type: ActivityItem["type"]) => {
  switch (type) {
    case "match_found":
      return <Badge className="bg-green-500/10 text-green-500 text-xs">Match</Badge>
    case "simulation_complete":
      return <Badge className="bg-primary/10 text-primary text-xs">Simulation</Badge>
    case "connection_made":
      return <Badge className="bg-purple-500/10 text-purple-500 text-xs">Connected</Badge>
    case "simulation_failed":
      return (
        <Badge variant="secondary" className="text-xs">
          Filtered
        </Badge>
      )
    case "agent_update":
      return <Badge className="bg-yellow-500/10 text-yellow-500 text-xs">Update</Badge>
    default:
      return null
  }
}

export function RecentActivity() {
  return (
    <Card className="glass border-border h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1">
          {MOCK_ACTIVITY.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                {getActivityIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  {getActivityBadge(item.type)}
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
