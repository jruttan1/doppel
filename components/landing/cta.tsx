import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-card rounded-lg p-8 sm:p-12 lg:p-16 text-center border border-border shadow-lg">
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
              Stop Networking.
              <br />
              <span className="text-teal-600 dark:text-teal-400">Start Connecting.</span>
            </h2>

            <p className="text-lg text-foreground/70 max-w-xl mx-auto mb-8 text-pretty font-normal">
              Deploy your Doppel today. While you sleep, your agent is making introductions that would have taken you
              months to find.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg">
                  Create Your Doppel
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
