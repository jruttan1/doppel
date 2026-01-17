import { Badge } from "@/components/ui/badge"
import { Rocket, Users, Network } from "lucide-react"

const personas = [
  {
    icon: Rocket,
    title: "The Founder",
    quote: "I need a technical co-founder who isn't risk-averse and ships fast.",
    pain: "Spent 6 months on Twitter, met 47 people, found 0 matches.",
    solution: "Doppel simulated 2,000+ conversations in a week. Found 3 perfect candidates.",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: Users,
    title: "The Operator",
    quote: "Looking for senior engineers who thrive in ambiguity.",
    pain: "Recruiter spam is killing my inbox. Quality candidates don't respond.",
    solution: "My agent only surfaces candidates whose agents confirm mutual interest.",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Network,
    title: "The Networker",
    quote: "I want to meet interesting people without 10 hours of coffee chats.",
    pain: "Networking events are hit or miss. Mostly miss.",
    solution: "Wake up to a curated list of high-compatibility intros, icebreakers included.",
    color: "from-green-500/20 to-emerald-500/20",
  },
]

export function Personas() {
  return (
    <section id="personas" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Use Cases
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">Built for Ambitious Professionals</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you&apos;re building, hiring, or connecting — your Doppel works for you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {personas.map((persona) => (
            <div
              key={persona.title}
              className="relative glass rounded-2xl p-8 overflow-hidden group hover:scale-[1.01] transition-transform"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${persona.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <persona.icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="text-xl font-bold mb-4">{persona.title}</h3>

                <blockquote className="text-lg italic text-foreground/90 mb-6 border-l-2 border-primary pl-4">
                  &ldquo;{persona.quote}&rdquo;
                </blockquote>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">The Pain</p>
                    <p className="text-sm text-muted-foreground">{persona.pain}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary mb-1">With Doppel</p>
                    <p className="text-sm">{persona.solution}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
