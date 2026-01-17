import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

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
  other: {
    "google-fonts-preconnect": "https://fonts.googleapis.com",
    "google-fonts-preconnect-gstatic": "https://fonts.gstatic.com",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
