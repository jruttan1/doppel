"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ZoomIn, ZoomOut, Search, Sparkles, Calendar, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { PROFILES } from "./mock-profiles"

interface NetworkNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  status: "unexplored" | "simulated" | "matched" | "connected"
  name: string
  role: string
  company: string
  compatibility?: number
  avatar?: string
  skills: string[]
}

const MOCK_NODES: Omit<NetworkNode, "x" | "y" | "vx" | "vy">[] = PROFILES.map((profile) => ({
  id: profile.id,
  status: profile.status,
  name: profile.name,
  role: profile.role,
  company: profile.company,
  compatibility: profile.compatibility,
  avatar: profile.avatar,
  skills: profile.skills,
}))

export function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const drawRef = useRef<(() => void) | null>(null)
  const zoomRef = useRef(1)
  const filterRef = useRef<"all" | "matched" | "simulated" | "unexplored">("all")
  const filteredNodesRef = useRef<NetworkNode[]>([])
  const [nodes, setNodes] = useState<NetworkNode[]>([])
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [filter, setFilter] = useState<"all" | "matched" | "simulated" | "unexplored">("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Update refs when state changes and trigger redraw
  useEffect(() => {
    zoomRef.current = zoom
    if (drawRef.current) {
      requestAnimationFrame(() => {
        if (drawRef.current) drawRef.current()
      })
    }
  }, [zoom])
  
  useEffect(() => {
    filterRef.current = filter
    if (drawRef.current) {
      requestAnimationFrame(() => {
        if (drawRef.current) drawRef.current()
      })
    }
  }, [filter])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Helper function to get node size for collision detection
    const getNodeSize = (status: NetworkNode["status"]) => {
      switch (status) {
        case "connected": return 16
        case "matched": return 14
        case "simulated": return 10
        default: return 8
      }
    }

    // Get minimum required distance between two nodes (reduced since no names)
    const getMinDistance = (node1: NetworkNode, node2: NetworkNode) => {
      const size1 = getNodeSize(node1.status)
      const size2 = getNodeSize(node2.status)
      // Node sizes + padding (no text label space needed)
      return size1 + size2 + 40
    }

    // Collision detection function
    const hasCollision = (x: number, y: number, existingNodes: NetworkNode[], currentNode: NetworkNode) => {
      return existingNodes.some((existing) => {
        const dist = Math.hypot(x - existing.x, y - existing.y)
        const minDist = getMinDistance(currentNode, existing)
        return dist < minDist
      })
    }

    // Sort nodes by status for ring placement: green (matched) first, then purple (connected), then teal (simulated), then grey (unexplored)
    const sortedNodes = [...MOCK_NODES].sort((a, b) => {
      const statusOrder = { matched: 0, connected: 1, simulated: 2, unexplored: 3 }
      return statusOrder[a.status] - statusOrder[b.status]
    })

    const initialNodes: NetworkNode[] = []
    const padding = 60
    const maxRadius = Math.min(rect.width, rect.height) / 2 - padding

    // Define rings based on status: green first, then purple, then teal, then grey
    const matchedNodes = sortedNodes.filter(n => n.status === "matched")
    const connectedNodes = sortedNodes.filter(n => n.status === "connected")
    const simulatedNodes = sortedNodes.filter(n => n.status === "simulated")
    const unexploredNodes = sortedNodes.filter(n => n.status === "unexplored")

    const rings = [
      { nodes: matchedNodes, baseRadius: 100, spacing: 80 },      // Green - first ring
      { nodes: connectedNodes, baseRadius: 180, spacing: 80 },    // Purple - second ring
      { nodes: simulatedNodes, baseRadius: 260, spacing: 80 },    // Teal - third ring
      { nodes: unexploredNodes, baseRadius: 340, spacing: 80 },   // Grey - fourth ring
    ]

    rings.forEach(ring => {
      const { nodes: ringNodes, baseRadius, spacing } = ring
      const currentRingRadius = Math.min(baseRadius, maxRadius)

      ringNodes.forEach((node, i) => {
        let attempts = 0
        let x = 0
        let y = 0
        let foundPosition = false

        while (!foundPosition && attempts < 200) {
          const angle = (i / ringNodes.length) * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI / ringNodes.length) * 0.8
          const radiusVariation = (Math.random() - 0.5) * 30
          const radius = currentRingRadius + radiusVariation

          x = centerX + Math.cos(angle) * radius
          y = centerY + Math.sin(angle) * radius

          // Check bounds
          if (x < padding || x > rect.width - padding || y < padding || y > rect.height - padding) {
            attempts++
            continue
          }

          // Check collision
          if (!hasCollision(x, y, initialNodes, { ...node, x, y, vx: 0, vy: 0 })) {
            foundPosition = true
          } else {
            attempts++
          }
        }

        // Fallback
        if (!foundPosition) {
          const gridX = (initialNodes.length % 10) * 80 + padding
          const gridY = Math.floor(initialNodes.length / 10) * 80 + padding
          x = gridX
          y = gridY
        }

        initialNodes.push({
          ...node,
          x: Math.max(padding, Math.min(rect.width - padding, x)),
          y: Math.max(padding, Math.min(rect.height - padding, y)),
          vx: 0,
          vy: 0,
        })
      })
    })

    setNodes(initialNodes)
  }, [])

  const filteredNodes = useMemo(() => {
    const result = nodes.filter((node) => {
      if (filter !== "all" && node.status !== filter) return false
      if (
        searchQuery &&
        !node.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !node.role.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !node.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false
      return true
    })
    filteredNodesRef.current = result
    return result
  }, [nodes, filter, searchQuery])

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

    const getNodeColor = (status: NetworkNode["status"]) => {
      switch (status) {
        case "connected":
          return { fill: "rgba(168, 85, 247, 0.9)", glow: "rgba(168, 85, 247, 0.5)", size: 16 }
        case "matched":
          return { fill: "rgba(34, 197, 94, 0.9)", glow: "rgba(34, 197, 94, 0.5)", size: 14 }
        case "simulated":
          return { fill: "rgba(45, 212, 191, 0.7)", glow: "rgba(45, 212, 191, 0.3)", size: 10 }
        default:
          return { fill: "rgba(100, 116, 139, 0.4)", glow: "rgba(100, 116, 139, 0.1)", size: 8 }
      }
    }

    const getInitials = (name: string) => {
      const parts = name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }

    const draw = () => {
      if (!ctx || !canvas) return
      
      // Get current values from refs (always latest)
      const currentZoom = zoomRef.current
      const currentFilteredNodes = filteredNodesRef.current
      
      ctx.clearRect(0, 0, rect.width, rect.height)

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.scale(currentZoom, currentZoom)
      ctx.translate(-centerX, -centerY)

      // Draw grid
      ctx.strokeStyle = "rgba(100, 116, 139, 0.05)"
      ctx.lineWidth = 1
      for (let i = 0; i < rect.width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, rect.height)
        ctx.stroke()
      }
      for (let i = 0; i < rect.height; i += 50) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(rect.width, i)
        ctx.stroke()
      }

      // Draw connections
      nodes.forEach((node) => {
        const isFiltered = currentFilteredNodes.some((n) => n.id === node.id)
        const colors = getNodeColor(node.status)
        const opacity = isFiltered ? 1 : 0.15
        const glowMatch = colors.glow.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (glowMatch) {
          const [, r, g, b] = glowMatch
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
        } else {
          ctx.strokeStyle = colors.glow
        }
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(node.x, node.y)
        ctx.lineWidth = node.status === "matched" || node.status === "connected" ? 2 : 0.5
        ctx.stroke()
      })

      // Draw inter-node connections (web-like network showing all connections)
      // Show connections between all nodes that are matched or connected
      nodes.forEach((node, i) => {
        if (node.status === "matched" || node.status === "connected") {
          nodes.slice(i + 1).forEach((other) => {
            // Show connections between any matched/connected nodes (not just to center)
            if (other.status === "matched" || other.status === "connected") {
              const isNodeFiltered = currentFilteredNodes.some((n) => n.id === node.id)
              const isOtherFiltered = currentFilteredNodes.some((n) => n.id === other.id)
              if (!isNodeFiltered || !isOtherFiltered) return
              const dist = Math.hypot(node.x - other.x, node.y - other.y)
              // Increase connection distance threshold to show more connections
              if (dist < 300) {
                ctx.beginPath()
                ctx.moveTo(node.x, node.y)
                ctx.lineTo(other.x, other.y)
                // Use different colors for different connection types
                const connectionOpacity = 0.2 * (1 - dist / 300)
                if (node.status === "connected" && other.status === "connected") {
                  ctx.strokeStyle = `rgba(168, 85, 247, ${connectionOpacity})`
                } else {
                  ctx.strokeStyle = `rgba(34, 197, 94, ${connectionOpacity})`
                }
                ctx.lineWidth = 1
                ctx.stroke()
              }
            }
          })
        }
      })
      
      // Also show connections from simulated nodes to matched/connected nodes
      nodes.forEach((node) => {
        if (node.status === "simulated") {
          const isNodeFiltered = currentFilteredNodes.some((n) => n.id === node.id)
          if (!isNodeFiltered) return
          
          nodes.forEach((other) => {
            if ((other.status === "matched" || other.status === "connected") && other.id !== node.id) {
              const isOtherFiltered = currentFilteredNodes.some((n) => n.id === other.id)
              if (!isOtherFiltered) return
              const dist = Math.hypot(node.x - other.x, node.y - other.y)
              if (dist < 250) {
                ctx.beginPath()
                ctx.moveTo(node.x, node.y)
                ctx.lineTo(other.x, other.y)
                ctx.strokeStyle = `rgba(45, 212, 191, ${0.1 * (1 - dist / 250)})`
                ctx.lineWidth = 0.5
                ctx.stroke()
              }
            }
          })
        }
      })

      // Draw center node
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40)
      gradient.addColorStop(0, "rgba(45, 212, 191, 0.4)")
      gradient.addColorStop(1, "rgba(45, 212, 191, 0)")
      ctx.beginPath()
      ctx.arc(centerX, centerY, 40, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      ctx.beginPath()
      ctx.arc(centerX, centerY, 22, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(45, 212, 191, 0.9)"
      ctx.fill()

      ctx.fillStyle = "#0d1117"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("YOU", centerX, centerY)

      // Draw outer nodes (NO NAMES - only initials)
      nodes.forEach((node) => {
        const isFiltered = currentFilteredNodes.some((n) => n.id === node.id)
        const colors = getNodeColor(node.status)
        const opacity = isFiltered ? 1 : 0.15

        if ((node.status === "matched" || node.status === "connected") && isFiltered) {
          const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, colors.size + 12)
          glowGradient.addColorStop(0, colors.glow)
          glowGradient.addColorStop(1, "transparent")
          ctx.beginPath()
          ctx.arc(node.x, node.y, colors.size + 12, 0, Math.PI * 2)
          ctx.fillStyle = glowGradient
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(node.x, node.y, colors.size, 0, Math.PI * 2)
        const fillMatch = colors.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (fillMatch) {
          const [, r, g, b] = fillMatch
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
        } else {
          ctx.fillStyle = colors.fill
        }
        ctx.fill()

        // Draw initials inside the node (NO NAME BELOW)
        const textOpacity = isFiltered ? 0.95 : 0.4
        ctx.fillStyle = `rgba(0, 0, 0, ${textOpacity})`
        ctx.font = `bold ${Math.max(8, colors.size * 0.5)}px sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        const initials = getInitials(node.name)
        ctx.fillText(initials, node.x, node.y)
      })

      ctx.restore()
    }

    // Store draw function in ref for external calls
    drawRef.current = draw

    // Force initial draw
    draw()

    const handleResize = () => {
      const newRect = container.getBoundingClientRect()
      canvas.width = newRect.width * window.devicePixelRatio
      canvas.height = newRect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      draw()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [nodes, filteredNodes, zoom, filter, searchQuery])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setMousePos({ x: e.clientX, y: e.clientY })

      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const adjustedX = (x - centerX) / zoom + centerX
      const adjustedY = (y - centerY) / zoom + centerY

      const hovered = filteredNodes.find((node) => {
        const dist = Math.hypot(node.x - adjustedX, node.y - adjustedY)
        return dist < 25
      })
      setHoveredNode(hovered || null)
    },
    [filteredNodes, zoom],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!hoveredNode) return
      
      if (hoveredNode.status === "matched" || hoveredNode.status === "connected") {
        setSelectedNode(hoveredNode)
      }
    },
    [hoveredNode],
  )

  // Mouse wheel zoom disabled
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      // Zoom on scroll disabled - allow normal page scrolling
    },
    [],
  )

  const handleMouseEnter = useCallback(() => {
    // Don't prevent page scrolling anymore
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredNode(null)
  }, [])

  return (
    <>
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Network Map</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48 h-9 bg-secondary/50"
              />
            </div>
            <div className="relative z-10 pointer-events-auto">
              <Tabs value={filter} onValueChange={(v) => {
                const newFilter = v as typeof filter
                if (v === "all" || v === "matched" || v === "simulated" || v === "unexplored") {
                  setFilter(newFilter)
                }
              }}>
                <TabsList className="bg-secondary/50 pointer-events-auto">
                  <TabsTrigger value="all" className="text-xs pointer-events-auto">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="matched" className="text-xs pointer-events-auto">
                    Matches
                  </TabsTrigger>
                  <TabsTrigger value="simulated" className="text-xs pointer-events-auto">
                    Simulated
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center gap-1 ml-2 relative z-10 pointer-events-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer pointer-events-auto"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const newZoom = Math.min(zoom + 0.2, 2)
                  setZoom(newZoom)
                }}
                type="button"
                disabled={false}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer pointer-events-auto"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const newZoom = Math.max(zoom - 0.2, 0.5)
                  setZoom(newZoom)
                }}
                type="button"
                disabled={false}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={containerRef} className="relative h-[600px]">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
              onClick={handleClick}
            />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 glass px-4 py-2 rounded-lg text-xs">
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

            {/* Stats */}
            <div className="absolute top-4 right-4 glass px-4 py-3 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Total Nodes</p>
                  <p className="font-bold text-lg">{nodes.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">High Matches</p>
                  <p className="font-bold text-lg text-green-500">
                    {nodes.filter((n) => n.status === "matched").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Hover tooltip */}
            {hoveredNode && (
              <div
                className="fixed z-50 glass px-4 py-3 rounded-lg pointer-events-none transform -translate-x-1/2 -translate-y-full min-w-[200px]"
                style={{ left: mousePos.x, top: mousePos.y - 10 }}
              >
                <p className="font-medium text-sm">{hoveredNode.name}</p>
                <p className="text-xs text-muted-foreground">
                  {hoveredNode.role} @ {hoveredNode.company}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {hoveredNode.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                {hoveredNode.compatibility && (
                  <Badge className="mt-2 bg-green-500/10 text-green-500 border-green-500/30">
                    {hoveredNode.compatibility}% match
                  </Badge>
                )}
                {(hoveredNode.status === "matched" || hoveredNode.status === "connected") && (
                  <p className="text-xs text-primary mt-2">Click to view details</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Node detail dialog */}
      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="max-w-lg bg-card border-border shadow-lg rounded-[4px] h-full w-full max-h-full sm:h-auto sm:max-h-[90vh] sm:w-auto sm:max-w-lg flex flex-col p-0 sm:p-6 fixed inset-0 sm:inset-auto sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] rounded-none sm:rounded-[4px]">
          {selectedNode && (
            <>
              <div className="flex-1 overflow-y-auto px-4 pr-12 sm:pr-4 sm:px-0 pb-4 sm:pb-0">
                <DialogHeader className="pt-6 sm:pt-0">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="w-16 h-16">
                        <AvatarImage
                          src={selectedNode.avatar || "/placeholder.svg?height=64&width=64&query=professional headshot"}
                        />
                        <AvatarFallback className="text-lg">
                          {selectedNode.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedNode.status === "matched" && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-xl">{selectedNode.name}</DialogTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedNode.role} @ {selectedNode.company}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {selectedNode.compatibility && (
                          <Badge className="bg-green-500/10 text-green-500">{selectedNode.compatibility}% Match</Badge>
                        )}
                        <Badge variant="secondary" className="capitalize">
                          {selectedNode.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Skills & Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNode.skills.map((skill) => (
                        <Badge key={skill} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedNode.compatibility && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Compatibility Breakdown</h4>
                      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Relevance</span>
                            <span>{Math.round(selectedNode.compatibility * 0.98)}%</span>
                          </div>
                          <Progress value={selectedNode.compatibility * 0.98} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Reciprocity</span>
                            <span>{Math.round(selectedNode.compatibility * 0.92)}%</span>
                          </div>
                          <Progress value={selectedNode.compatibility * 0.92} className="h-2" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tone Match</span>
                            <span>{Math.round(selectedNode.compatibility * 1.02)}%</span>
                          </div>
                          <Progress value={Math.min(selectedNode.compatibility * 1.02, 100)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-4 sm:pb-0">
                    <Button className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Calendar className="w-4 h-4" />
                      Book Coffee Chat
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 bg-transparent">
                      <MessageSquare className="w-4 h-4" />
                      View Simulation
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
