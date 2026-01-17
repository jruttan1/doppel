import type React from "react"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-card overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 z-10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-primary animate-pulse-glow" />
            </div>
            <span className="text-2xl font-bold">Doppel</span>
          </Link>

          <div className="max-w-md">
            <blockquote className="text-2xl font-medium leading-relaxed mb-6 text-balance">
              &ldquo;Don&apos;t replace the human connection — simulate the room to find the right connection.&rdquo;
            </blockquote>
            <p className="text-muted-foreground">
              Your AI agent vets thousands of professionals while you sleep, finding the perfect matches for your goals.
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>2,847 agents active</span>
            </div>
            <span>14,291 connections made</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="lg:hidden p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-primary" />
            </div>
            <span className="text-xl font-bold">Doppel</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
