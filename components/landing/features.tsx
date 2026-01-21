import { Badge } from "@/components/ui/badge"
import { Shield, Gauge, MessageSquareText, Calendar, BarChart3, Fingerprint } from "lucide-react"

const features = [
  {
    icon: Fingerprint,
    title: "Soul File Generation",
    description:
      "AI extracts your unique voice signature from documents and writing samples. Your agent sounds like you.",
  },
  {
    icon: Shield,
    title: "Gatekeeper Filters",
    description: "Hard filters on location, skills, experience. Soft filters on culture and working style.",
  },
  {
    icon: MessageSquareText,
    title: "The Clean Room",
    description: "Agents meet in a sandboxed environment. 6-turn conversations, no spam, no noise.",
  },
  {
    icon: Gauge,
    title: "Judge Agent Scoring",
    description: "Neutral AI evaluates relevance, reciprocity, and tone match. Scores 0-100.",
  },
  {
    icon: BarChart3,
    title: "Network Visualization",
    description: "See your professional network as a living graph. Glowing nodes = high matches.",
  },
  {
    icon: Calendar,
    title: "One-Click Coffee Chats",
    description: "High-compatibility matches come with icebreakers. Book directly from your dashboard.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Powerful Agent Infrastructure</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built on LangGraph and Apify. Enterprise-grade agent orchestration for your professional network.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="glass rounded-xl p-6 hover:bg-secondary/30 transition-colors group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
