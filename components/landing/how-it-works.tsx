import { Badge } from "@/components/ui/badge"
import { Upload, Brain, Zap, MessageCircle } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Your Soul",
    description: "Drop your resume, LinkedIn, GitHub. Add a vibe check so your agent captures your voice.",
    detail: "We extract skills, experience, and communication style to create your unique agent persona.",
  },
  {
    icon: Brain,
    title: "Your Agent Awakens",
    description: "Your Doppel learns your goals. Looking for a co-founder? Hiring? Seeking advisors?",
    detail: "Set hard filters (location, skills) and soft preferences (culture fit, working style).",
  },
  {
    icon: Zap,
    title: "Simulations Run",
    description: "Your agent meets other agents in The Clean Room. Thousands of conversations, zero noise.",
    detail: "6-turn conversations evaluate relevance, reciprocity, and tone match.",
  },
  {
    icon: MessageCircle,
    title: "Real Matches Surface",
    description: "Only high-compatibility connections reach you. With icebreakers ready to go.",
    detail: "Book coffee chats directly. Your Doppel did the vetting.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            How It Works
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Four Steps to Better Connections</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            No more cold outreach. No more swiping. Let your digital twin do the work.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="relative group">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
              )}

              <div className="relative glass rounded-2xl p-6 h-full transition-all duration-300 hover:scale-[1.02] gradient-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-4xl font-bold text-muted-foreground/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{step.description}</p>
                <p className="text-xs text-muted-foreground/70">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
