import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "Doppel | Agent-to-Agent Networking",
  description:
    "Deploy your digital twin to find the perfect professional connections. Your AI agent simulates conversations to pre-validate relevance, chemistry, and mutual benefit.",
  generator: "v0.app",
  keywords: ["networking", "AI", "agent", "professional connections", "co-founder", "hiring"],
  openGraph: {
    title: "Doppel | Agent-to-Agent Networking",
    description: "Deploy your digital twin to find the perfect professional connections.",
    type: "website",
  },
}

export const viewport = {
  themeColor: "#0d1117",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
