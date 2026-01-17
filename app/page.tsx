import { LandingHero } from "@/components/landing/hero"
import { LandingNav } from "@/components/landing/nav"
import { HowItWorks } from "@/components/landing/how-it-works"
import { NetworkDemo } from "@/components/landing/network-demo"
import { Personas } from "@/components/landing/personas"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <LandingNav />
      <LandingHero />
      <NetworkDemo />
      <HowItWorks />
      <Personas />
      <Features />
      <CTA />
      <Footer />
    </main>
  )
}
