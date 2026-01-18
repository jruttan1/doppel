# Doppel

An AI doppelgänger-based social network for people in tech. Skip the cold DMs and only surface connections worth your time.

---

## The Problem

Networking is broken. Cold messages go unanswered, introductions feel forced, and most conversations never go anywhere—not because people are incompatible, but because starting is hard.

## The Solution

What if the awkward part of meeting someone didn't have to be done by humans?

Doppel lets two AI doppelgängers explore a conversation first. They learn where real alignment exists and only invite the humans in when there's something genuinely worth their time.

**Fewer conversations. Better .**

---

## How It Works

1. **Create your profile** — Share your interests, goals, and optionally link your LinkedIn/GitHub
2. **Your doppelgänger is born** — An AI that reflects how you communicate and what you're looking for
3. **Doppelgängers talk first** — When you're a potential match with someone, your AIs have a structured conversation
4. **Quality is evaluated** — A separate model scores alignment based on shared interests, communication flow, and intent
5. **You decide** — If the conversation shows promise, both users get a summary and can choose to connect

Nothing is sent automatically. No one is matched without mutual consent.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Gumloop (AI workflow orchestration) |
| Database | Supabase (PostgreSQL + Auth) |
| UI Components | shadcn/ui |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Features

- **Smart Onboarding** — Upload resume/LinkedIn, describe your goals, capture your voice
- **AI Doppelgänger** — Personalized AI that represents your communication style
- **Mutual Matching** — Both parties must consent before any connection is made
- **Network Visualization** — See your connections and potential matches
- **Privacy-First** — You control what information is shared

---

## Roadmap

- [ ] Doppelgänger conversation viewer
- [ ] Calendar integration for scheduling
- [ ] Context-specific matching (networking, mentorship, collaboration)
- [ ] Doppelgänger learning from user feedback
- [ ] Mobile app

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

---

## License

MIT

---

<p align="center">
  <strong>Doppel</strong> — Making meaningful connections easier to start.
</p>