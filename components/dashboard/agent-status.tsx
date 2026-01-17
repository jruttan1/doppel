"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RefreshCw, Zap } from "lucide-react"

export function AgentStatus() {
  const [isActive, setIsActive] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  return (
    <Card className="bg-card border-border overflow-hidden shadow-md">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
      <CardContent className="relative p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Zap className="w-6 h-6 text-teal-500 dark:text-teal-400" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">Your Doppel</h3>
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={isActive ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}
                >
                  {isActive ? "Active" : "Paused"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? "Running simulations and finding matches..."
                  : "Agent is paused. Resume to continue networking."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex-1 sm:flex-none gap-2 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant={isActive ? "outline" : "default"}
              size="sm"
              onClick={() => setIsActive(!isActive)}
              className={`flex-1 sm:flex-none gap-2 ${isActive ? "bg-transparent" : "bg-primary text-primary-foreground"}`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
