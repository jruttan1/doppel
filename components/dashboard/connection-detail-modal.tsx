"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, MessageCircle, Linkedin, ExternalLink, Sparkles, Target, Users, MessageSquare } from "lucide-react"

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

interface ConnectionDetailModalProps {
  connection: ConnectionPreview | null
  onClose: () => void
}

export function ConnectionDetailModal({ connection, onClose }: ConnectionDetailModalProps) {
  if (!connection) return null

  const scores = {
    relevance: 92,
    reciprocity: 88,
    toneMatch: 95,
  }

  const talkingPoints = [
    "Both have experience scaling engineering teams from 5 to 50+",
    "Shared interest in developer experience and tooling",
    "Complementary skills: your backend expertise + their frontend focus",
  ]

  return (
    <Dialog open={!!connection} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg glass border-border">
        <DialogHeader>
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
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{connection.name}</DialogTitle>
              <DialogDescription className="text-sm">{connection.role}</DialogDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                  {connection.compatibility}% Match
                </Badge>
                <span className="text-xs text-muted-foreground">{connection.matchedAt}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Compatibility Breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Compatibility Breakdown
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Relevance</span>
                  <span>{scores.relevance}%</span>
                </div>
                <Progress value={scores.relevance} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reciprocity</span>
                  <span>{scores.reciprocity}%</span>
                </div>
                <Progress value={scores.reciprocity} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tone Match</span>
                  <span>{scores.toneMatch}%</span>
                </div>
                <Progress value={scores.toneMatch} className="h-2" />
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Calendar className="w-4 h-4" />
              Book Coffee Chat
            </Button>
            <Button variant="outline" className="flex-1 gap-2 bg-transparent">
              <MessageCircle className="w-4 h-4" />
              View Simulation
            </Button>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
