import Link from "next/link"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface OnboardingHeaderProps {
  currentStep: number
  steps: string[]
}

export function OnboardingHeader({ currentStep, steps }: OnboardingHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary" />
            </div>
            <span className="text-xl font-bold">Doppel</span>
          </Link>

          <p className="text-sm text-muted-foreground">Creating your Soul File</p>
        </div>

        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => (
            <div key={step} className="relative flex flex-col items-center z-10">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-secondary text-muted-foreground",
                )}
              >
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "absolute top-10 text-xs whitespace-nowrap transition-colors",
                  index <= currentStep ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
