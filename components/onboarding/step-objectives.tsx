"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Target, Rocket, Users, Briefcase, DollarSign, Lightbulb, Check } from "lucide-react"
import type { SoulFileData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StepObjectivesProps {
  soulData: Partial<SoulFileData>
  updateSoulData: (data: Partial<SoulFileData>) => void
  onNext: () => void
  onPrev: () => void
}

const OBJECTIVES = [
  {
    id: "cofounder",
    icon: Rocket,
    title: "Find a Co-founder",
    description: "Technical or non-technical partner to build with",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "hire",
    icon: Users,
    title: "Hire Talent",
    description: "Engineers, designers, or operators for your team",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "job",
    icon: Briefcase,
    title: "Find a Role",
    description: "Your next career opportunity",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    id: "invest",
    icon: DollarSign,
    title: "Invest / Get Investment",
    description: "Angel investing or fundraising",
    color: "from-yellow-500/20 to-orange-500/20",
  },
  {
    id: "advise",
    icon: Lightbulb,
    title: "Advisory / Mentorship",
    description: "Give or receive guidance",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "network",
    icon: Target,
    title: "General Networking",
    description: "Meet interesting people in your space",
    color: "from-teal-500/20 to-cyan-500/20",
  },
]

export function StepObjectives({ soulData, updateSoulData, onNext, onPrev }: StepObjectivesProps) {
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(soulData.objectives || [])

  const toggleObjective = (id: string) => {
    setSelectedObjectives((prev) => {
      if (prev.includes(id)) {
        return prev.filter((o) => o !== id)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, id]
    })
  }

  const handleNext = () => {
    updateSoulData({ objectives: selectedObjectives })
    onNext()
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Goals</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">What Are You Looking For?</h1>
        <p className="text-muted-foreground">
          Select up to 3 objectives. Your Doppel will prioritize connections that match these goals.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-center mb-4">
          <Badge variant="outline">{selectedObjectives.length}/3 selected</Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {OBJECTIVES.map((objective) => {
            const isSelected = selectedObjectives.includes(objective.id)
            const isDisabled = !isSelected && selectedObjectives.length >= 3

            return (
              <Card
                key={objective.id}
                className={cn(
                  "relative cursor-pointer transition-all overflow-hidden",
                  isSelected ? "ring-2 ring-primary bg-primary/5" : "glass hover:bg-secondary/30",
                  isDisabled && "opacity-50 cursor-not-allowed",
                )}
                onClick={() => !isDisabled && toggleObjective(objective.id)}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", objective.color)} />
                <div className="relative p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center">
                      <objective.icon className="w-5 h-5 text-primary" />
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{objective.title}</h3>
                  <p className="text-sm text-muted-foreground">{objective.description}</p>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedObjectives.length === 0}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
