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
            <span className="text-2xl font-bold font-mono">Doppel</span>
          </Link>

          <div className="max-w-md">
            <blockquote className="text-2xl font-medium leading-relaxed mb-6 text-balance">
              &ldquo;Deploy your digital twin to vet thousands of potential co-founders and hires while you sleep. Only take the meetings that matter.&rdquo;
            </blockquote>
          </div>

       
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="lg:hidden p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold font-mono">Doppel</span>
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
