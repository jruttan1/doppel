"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, ArrowRight, Sparkles, Bot } from "lucide-react"

interface SimulationMessage {
  agent: "A" | "B"
  message: string
}

const MOCK_SIMULATION: SimulationMessage[] = [
  {
    agent: "A",
    message: "Hey! I noticed you've scaled engineering teams before. I'm building something similar at my startup...",
  },
  {
    agent: "B",
    message: "Interesting! What's your current tech stack? I've had success with event-driven architectures at scale.",
  },
  {
    agent: "A",
    message: "We're using Next.js + Go microservices. The challenge is real-time sync across 50+ services.",
  },
  { agent: "B", message: "That resonates. Have you considered CQRS? Happy to share what worked for us." },
]

export function SimulationPreview() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (currentIndex < MOCK_SIMULATION.length - 1) {
      const timer = setTimeout(() => {
        setIsTyping(true)
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1)
          setIsTyping(false)
        }, 1500)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [currentIndex])

  return (
    <Card className="glass border-border h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Live Simulation
          </CardTitle>
          <Badge className="bg-green-500/10 text-green-500 animate-pulse">In Progress</Badge>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium">Your Agent</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/woman-tech-executive.jpg" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Sarah Chen</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 max-h-[250px] overflow-y-auto">
          {MOCK_SIMULATION.slice(0, currentIndex + 1).map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.agent === "A" ? "" : "justify-end"}`}>
              <div
                className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  msg.agent === "A" ? "bg-primary/10 border border-primary/20" : "bg-secondary"
                }`}
              >
                <p className="text-muted-foreground leading-relaxed">{msg.message}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 justify-end">
              <div className="bg-secondary p-3 rounded-xl">
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
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>Compatibility looking strong</span>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              View Full
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
