"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Maximize2, ZoomIn, ZoomOut } from "lucide-react"

interface NetworkNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  status: "unexplored" | "simulated" | "matched" | "connected"
  name: string
  role: string
  compatibility?: number
}

// Mock data for demo
const MOCK_NODES: Omit<NetworkNode, "x" | "y" | "vx" | "vy">[] = [
  { id: "1", status: "matched", name: "Sarah Chen", role: "CTO @ Fintech Startup", compatibility: 94 },
  { id: "2", status: "matched", name: "Marcus Reed", role: "Eng Lead @ Series B", compatibility: 87 },
  { id: "3", status: "connected", name: "Julia Park", role: "PM @ AI Company", compatibility: 91 },
  { id: "4", status: "simulated", name: "David Kim", role: "Founder @ B2B SaaS" },
  { id: "5", status: "simulated", name: "Alex Morgan", role: "VP Engineering" },
  { id: "6", status: "unexplored", name: "Rachel Liu", role: "Staff Eng @ FAANG" },
  { id: "7", status: "matched", name: "Chris Patel", role: "Angel Investor", compatibility: 89 },
  { id: "8", status: "simulated", name: "Emma Wilson", role: "Design Lead" },
  { id: "9", status: "unexplored", name: "James Taylor", role: "Backend Eng" },
  { id: "10", status: "simulated", name: "Sophia Adams", role: "Head of Growth" },
  { id: "11", status: "unexplored", name: "Mike Johnson", role: "DevOps Lead" },
  { id: "12", status: "matched", name: "Lisa Wang", role: "Co-founder @ Web3", compatibility: 85 },
  { id: "13", status: "simulated", name: "Tom Brown", role: "ML Engineer" },
  { id: "14", status: "unexplored", name: "Nina Patel", role: "Product Designer" },
  { id: "15", status: "unexplored", name: "Ryan Lee", role: "Data Scientist" },
]

export function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Initialize nodes in organic positions
    const initialNodes: NetworkNode[] = MOCK_NODES.map((node, i) => {
      const angle = (i / MOCK_NODES.length) * Math.PI * 2 + Math.random() * 0.5
      const radius = 80 + Math.random() * 100
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }
    })
    setNodes(initialNodes)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || nodes.length === 0) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    let animationId: number

    const getNodeColor = (status: NetworkNode["status"]) => {
      switch (status) {
        case "connected":
          return { fill: "rgba(168, 85, 247, 0.9)", glow: "rgba(168, 85, 247, 0.5)", size: 14 }
        case "matched":
          return { fill: "rgba(34, 197, 94, 0.9)", glow: "rgba(34, 197, 94, 0.5)", size: 12 }
        case "simulated":
          return { fill: "rgba(45, 212, 191, 0.7)", glow: "rgba(45, 212, 191, 0.3)", size: 8 }
        default:
          return { fill: "rgba(100, 116, 139, 0.4)", glow: "rgba(100, 116, 139, 0.1)", size: 6 }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Apply zoom transformation
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(zoom, zoom)
      ctx.translate(-centerX, -centerY)

      // Update node positions
      nodes.forEach((node) => {
        node.x += node.vx
        node.y += node.vy

        // Bounce off edges
        const padding = 50
        if (node.x < padding || node.x > rect.width - padding) node.vx *= -0.8
        if (node.y < padding || node.y > rect.height - padding) node.vy *= -0.8

        // Keep in bounds
        node.x = Math.max(padding, Math.min(rect.width - padding, node.x))
        node.y = Math.max(padding, Math.min(rect.height - padding, node.y))

        // Gentle attraction to center
        const dx = centerX - node.x
        const dy = centerY - node.y
        node.vx += dx * 0.00005
        node.vy += dy * 0.00005

        // Damping
        node.vx *= 0.995
        node.vy *= 0.995
      })

      // Draw connections to center
      nodes.forEach((node) => {
        const colors = getNodeColor(node.status)
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(node.x, node.y)
        ctx.strokeStyle = colors.glow
        ctx.lineWidth = node.status === "matched" || node.status === "connected" ? 1.5 : 0.5
        ctx.stroke()
      })

      // Draw connections between matched/connected nodes
      nodes.forEach((node, i) => {
        if (node.status === "matched" || node.status === "connected") {
          nodes.slice(i + 1).forEach((other) => {
            if (other.status === "matched" || other.status === "connected") {
              const dist = Math.hypot(node.x - other.x, node.y - other.y)
              if (dist < 180) {
                ctx.beginPath()
                ctx.moveTo(node.x, node.y)
                ctx.lineTo(other.x, other.y)
                ctx.strokeStyle = `rgba(34, 197, 94, ${0.2 * (1 - dist / 180)})`
                ctx.lineWidth = 1
                ctx.stroke()
              }
            }
          })
        }
      })

      // Draw center node (You)
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 30)
      gradient.addColorStop(0, "rgba(45, 212, 191, 0.3)")
      gradient.addColorStop(1, "rgba(45, 212, 191, 0)")
      ctx.beginPath()
      ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.beginPath()
      ctx.arc(centerX, centerY, 18, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(45, 212, 191, 0.9)"
      ctx.fill()

      ctx.fillStyle = "#0d1117"
      ctx.font = "bold 10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("YOU", centerX, centerY)

      // Draw outer nodes
      nodes.forEach((node) => {
        const colors = getNodeColor(node.status)

        // Glow effect for matched/connected
        if (node.status === "matched" || node.status === "connected") {
          const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, colors.size + 10)
          glowGradient.addColorStop(0, colors.glow)
          glowGradient.addColorStop(1, "transparent")
          ctx.beginPath()
          ctx.arc(node.x, node.y, colors.size + 10, 0, Math.PI * 2)
          ctx.fillStyle = glowGradient
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, colors.size, 0, Math.PI * 2)
        ctx.fillStyle = colors.fill
        ctx.fill()
      })

      ctx.restore()
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [nodes, zoom])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setMousePos({ x: e.clientX, y: e.clientY })

      // Adjust for zoom
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const adjustedX = (x - centerX) / zoom + centerX
      const adjustedY = (y - centerY) / zoom + centerY

      const hovered = nodes.find((node) => {
        const dist = Math.hypot(node.x - adjustedX, node.y - adjustedY)
        return dist < 20
      })
      setHoveredNode(hovered || null)
    },
    [nodes, zoom],
  )

  return (
    <Card className="bg-card border-border h-full shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Network Map</CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={containerRef} className="relative h-[400px]">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredNode(null)}
          />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 glass px-3 py-2 rounded-lg text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-muted-foreground">Connected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Match</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/70" />
              <span className="text-muted-foreground">Simulated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-500/40" />
              <span className="text-muted-foreground">Unexplored</span>
            </div>
          </div>

          {/* Hover tooltip */}
          {hoveredNode && (
            <div
              className="fixed z-50 glass px-4 py-3 rounded-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
              style={{ left: mousePos.x, top: mousePos.y - 10 }}
            >
              <p className="font-medium text-sm">{hoveredNode.name}</p>
              <p className="text-xs text-muted-foreground">{hoveredNode.role}</p>
              {hoveredNode.compatibility && (
                <Badge variant="outline" className="mt-2 text-green-500 border-green-500/30">
                  {hoveredNode.compatibility}% match
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
