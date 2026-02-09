"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react"
import type { SoulFileData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StepVibeCheckProps {
  soulData: Partial<SoulFileData>
  updateSoulData: (data: Partial<SoulFileData>) => void
  onNext: () => void
  onPrev: () => void
}

const MIN_CONTRIBUTIONS = 3
const MAX_SAMPLES = 5
const MIN_ANSWER_LENGTH = 30

// Clean pasted text: remove timestamps, links, "replying to" tags, etc.
function cleanSample(text: string): string {
  return text
    // Remove "Replying to @username" patterns
    .replace(/^Replying to @\w+\s*/gim, '')
    // Remove relative timestamps (e.g., "2h", "3d", "1w")
    .replace(/^\d+[hdwm]\s*/gim, '')
    // Remove t.co and other shortened links
    .replace(/https?:\/\/t\.co\/\S+/gi, '')
    // Remove general URLs
    .replace(/https?:\/\/\S+/gi, '')
    // Remove "Show this thread" type UI text
    .replace(/Show this thread/gi, '')
    // Remove Twitter engagement metrics (e.g., "10 Retweets 5 Likes")
    .replace(/\d+\s*(Retweets?|Likes?|Replies|Views|Reposts?|Quotes?)/gi, '')
    // Remove "Retweet" or "RT @user:" prefixes
    .replace(/^RT\s*@\w+:?\s*/gim, '')
    // Remove multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim()
}

export function StepVibeCheck({ soulData, updateSoulData, onNext, onPrev }: StepVibeCheckProps) {
  const [mode, setMode] = useState<"samples" | "questions">("samples")
  const [samples, setSamples] = useState<string[]>(
    soulData.vibeCheck ? soulData.vibeCheck.split("\n\n---\n\n").filter(s => s.trim() && !s.startsWith("[")) : []
  )
  const [currentInput, setCurrentInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [answers, setAnswers] = useState({
    hill: "",
    roast: "",
    collaborator: ""
  })

  // Count contributions from both modes
  const sampleCount = samples.length
  const answeredQuestions = [answers.hill, answers.roast, answers.collaborator]
    .filter(a => a.length >= MIN_ANSWER_LENGTH).length
  const totalContributions = sampleCount + answeredQuestions
  const isValid = totalContributions >= MIN_CONTRIBUTIONS
  const progress = Math.min(totalContributions / MIN_CONTRIBUTIONS, 1)

  const handleAddSample = () => {
    if (!currentInput.trim() || samples.length >= MAX_SAMPLES) return

    setIsProcessing(true)

    // Simulate brief processing for the "neural link" feel
    setTimeout(() => {
      const cleaned = cleanSample(currentInput)
      if (cleaned.length >= 20) {
        setSamples(prev => [...prev, cleaned])
        setCurrentInput("")
      }
      setIsProcessing(false)
    }, 300)
  }

  const handleRemoveSample = (index: number) => {
    setSamples(prev => prev.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleAddSample()
    }
  }

  const handleNext = () => {
    // Combine samples and answers into voice_snippet
    const parts: string[] = []

    // Add pasted samples
    samples.forEach(sample => {
      parts.push(sample)
    })

    // Add answered questions (formatted)
    if (answers.hill.length >= MIN_ANSWER_LENGTH) {
      parts.push(`[Opinion] ${answers.hill}`)
    }
    if (answers.roast.length >= MIN_ANSWER_LENGTH) {
      parts.push(`[Self-Roast] ${answers.roast}`)
    }
    if (answers.collaborator.length >= MIN_ANSWER_LENGTH) {
      parts.push(`[Ideal Collaborator] ${answers.collaborator}`)
    }

    const combinedVoice = parts.join("\n\n---\n\n")

    updateSoulData({
      vibeCheck: combinedVoice,
      raw_assets: {
        ...soulData.raw_assets,
        voice_snippet: combinedVoice,
      },
    })
    onNext()
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-white/60" />
          <span className="text-xs font-mono text-white/60 tracking-wide">VOICE CALIBRATION</span>
        </div>

        <h1 className="text-4xl font-light mb-3 text-white">
          Set Your Vibe
        </h1>
        <p className="text-white/50 max-w-md mx-auto">
          Help us understand how you communicate. Paste texts or answer questions.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
        <button
          type="button"
          onClick={() => setMode("samples")}
          className={cn(
            "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            mode === "samples"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white/70"
          )}
        >
          Paste Texts
        </button>
        <button
          type="button"
          onClick={() => setMode("questions")}
          className={cn(
            "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            mode === "questions"
              ? "bg-white/10 text-white"
              : "text-white/50 hover:text-white/70"
          )}
        >
          Answer Questions
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-mono text-white/40">
            {totalContributions}/{MIN_CONTRIBUTIONS} contributions
          </span>
          {totalContributions >= MIN_CONTRIBUTIONS && totalContributions < 5 && (
            <span className="text-sm text-white/60">
              +{5 - totalContributions} optional
            </span>
          )}
          {totalContributions >= 5 && (
            <span className="text-sm text-white/60">Maximum reached</span>
          )}
        </div>
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-white/40 to-white/70 transition-all duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        {/* Breakdown */}
        {(sampleCount > 0 || answeredQuestions > 0) && (
          <div className="flex gap-4 mt-2 text-xs text-white/30">
            {sampleCount > 0 && <span>{sampleCount} pasted</span>}
            {answeredQuestions > 0 && <span>{answeredQuestions} answered</span>}
          </div>
        )}
      </div>

      {/* Mode: Paste Texts */}
      {mode === "samples" && (
        <>
          {/* Uploaded Samples */}
          {samples.length > 0 && (
            <div className="space-y-3 mb-6">
              {samples.map((sample, index) => (
                <div
                  key={index}
                  className="group relative rounded-xl bg-white/[0.03] border border-white/10 p-4"
                >
                  <button
                    onClick={() => handleRemoveSample(index)}
                    className="absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                  <p className="text-sm text-white/70 pr-8 line-clamp-3">
                    "{sample}"
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-mono text-white/30">
                      Sample #{index + 1}
                    </span>
                    <span className="text-xs text-white/20">•</span>
                    <span className="text-xs text-white/30">
                      {sample.length} chars
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          {samples.length < MAX_SAMPLES && (
            <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6 mb-6">
              <div className="mb-4">
                <p className="text-sm text-white/50">
                  Paste a tweet, post, or anything you've written that captures your voice
                </p>
              </div>

              <textarea
                placeholder="Copy-paste something you wrote that sounds like you..."
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full min-h-[120px] bg-transparent border-0 border-b-2 border-white/10 text-base placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none px-0 py-2"
              />

              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-white/30">
                  {currentInput.length > 0 && currentInput.length < 20
                    ? `${20 - currentInput.length} more chars needed`
                    : '⌘ + Enter to add'}
                </span>
                <Button
                  onClick={handleAddSample}
                  disabled={currentInput.trim().length < 20 || isProcessing}
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-0 disabled:opacity-30"
                >
                  {isProcessing ? (
                    <span className="font-mono">Processing...</span>
                  ) : (
                    <>Add Sample</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 mb-8">
            <p className="text-xs text-white/40 mb-2 font-medium">Good samples include:</p>
            <ul className="text-xs text-white/30 space-y-1">
              <li>• Hot takes on your industry</li>
              <li>• Sarcastic observations or jokes</li>
              <li>• Strong opinions about tech, work, or life</li>
              <li>• How you'd explain something to a friend</li>
            </ul>
          </div>
        </>
      )}

      {/* Mode: Answer Questions */}
      {mode === "questions" && (
        <div className="space-y-4 mb-8">
          {/* Question 1 */}
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <label className="block text-sm font-medium text-white mb-2">
              What's a hill you'll die on?
            </label>
            <textarea
              placeholder=""
              value={answers.hill}
              onChange={(e) => setAnswers(prev => ({ ...prev, hill: e.target.value }))}
              className="w-full min-h-[80px] bg-transparent border-0 border-b border-white/10 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none py-2"
            />
            <span className={cn(
              "text-xs mt-1 block",
              answers.hill.length >= MIN_ANSWER_LENGTH ? "text-white/50" : "text-white/30"
            )}>
              {answers.hill.length}/{MIN_ANSWER_LENGTH} min
            </span>
          </div>

          {/* Question 2 */}
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <label className="block text-sm font-medium text-white mb-2">
              How would you roast your own resume?
            </label>
            <textarea
              placeholder=""
              value={answers.roast}
              onChange={(e) => setAnswers(prev => ({ ...prev, roast: e.target.value }))}
              className="w-full min-h-[80px] bg-transparent border-0 border-b border-white/10 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none py-2"
            />
            <span className={cn(
              "text-xs mt-1 block",
              answers.roast.length >= MIN_ANSWER_LENGTH ? "text-white/50" : "text-white/30"
            )}>
              {answers.roast.length}/{MIN_ANSWER_LENGTH} min
            </span>
          </div>

          {/* Question 3 */}
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
            <label className="block text-sm font-medium text-white mb-2">
              Explain why your favourite movie is your favourite movie
            </label>
            <textarea
              placeholder=""
              value={answers.collaborator}
              onChange={(e) => setAnswers(prev => ({ ...prev, collaborator: e.target.value }))}
              className="w-full min-h-[80px] bg-transparent border-0 border-b border-white/10 text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none py-2"
            />
            <span className={cn(
              "text-xs mt-1 block",
              answers.collaborator.length >= MIN_ANSWER_LENGTH ? "text-white/50" : "text-white/30"
            )}>
              {answers.collaborator.length}/{MIN_ANSWER_LENGTH} min
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={onPrev}
          className="gap-2 text-white/50 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="gap-2 bg-white text-black hover:bg-white/90 border-0 h-12 px-6 disabled:opacity-30"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
