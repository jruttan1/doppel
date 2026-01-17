"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Sparkles, MessageCircle } from "lucide-react"
import type { SoulFileData } from "@/lib/types"

interface StepVibeCheckProps {
  soulData: Partial<SoulFileData>
  updateSoulData: (data: Partial<SoulFileData>) => void
  onNext: () => void
  onPrev: () => void
}

const PROMPTS = [
  "Write a message to a potential co-founder you've never met.",
  "Describe your perfect weekend side project.",
  "How would you explain your work to a smart 10-year-old?",
]

const EXAMPLE_VIBES = [
  { label: "Casual", example: "hey! saw your project - super cool stuff. would love to jam on ideas sometime" },
  {
    label: "Professional",
    example: "Hi there, I noticed your work on X and think there could be strong synergies between our approaches.",
  },
  {
    label: "Technical",
    example: "Your implementation of the state machine pattern is elegant. Curious about the perf.",
  },
]

export function StepVibeCheck({ soulData, updateSoulData, onNext, onPrev }: StepVibeCheckProps) {
  const [vibeCheck, setVibeCheck] = useState(soulData.vibeCheck || "")
  const [selectedPrompt, setSelectedPrompt] = useState(0)

  const handleNext = () => {
    updateSoulData({ vibeCheck })
    onNext()
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Voice Signature</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Capture Your Vibe</h1>
        <p className="text-muted-foreground">
          Write naturally. We&apos;ll analyze your tone, word choice, and style so your Doppel sounds like you.
        </p>
      </div>

      <div className="space-y-6">
        {/* Prompt selector */}
        <div className="flex flex-wrap gap-2 justify-center">
          {PROMPTS.map((prompt, index) => (
            <Badge
              key={index}
              variant={selectedPrompt === index ? "default" : "outline"}
              className="cursor-pointer px-3 py-1"
              onClick={() => setSelectedPrompt(index)}
            >
              Prompt {index + 1}
            </Badge>
          ))}
        </div>

        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              {PROMPTS[selectedPrompt]}
            </CardTitle>
            <CardDescription>Write at least 100 characters. The more natural, the better.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Start typing how you'd actually write..."
              value={vibeCheck}
              onChange={(e) => setVibeCheck(e.target.value)}
              className="min-h-[200px] bg-input border-border resize-none"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{vibeCheck.length} characters</span>
              <span>{vibeCheck.length >= 100 ? "Looking good!" : `${100 - vibeCheck.length} more to go`}</span>
            </div>
          </CardContent>
        </Card>

        {/* Example vibes */}
        <div>
          <p className="text-sm text-muted-foreground mb-3 text-center">Need inspiration? Here are some styles:</p>
          <div className="grid gap-3">
            {EXAMPLE_VIBES.map((vibe) => (
              <button
                key={vibe.label}
                className="text-left p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-transparent hover:border-primary/20"
                onClick={() => setVibeCheck(vibe.example)}
              >
                <Badge variant="outline" className="mb-2">
                  {vibe.label}
                </Badge>
                <p className="text-sm text-muted-foreground italic">&ldquo;{vibe.example}&rdquo;</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={vibeCheck.length < 100}
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
