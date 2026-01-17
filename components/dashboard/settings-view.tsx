"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Github, Linkedin, MessageSquare, Target, Filter, X, Upload, Rocket, Users, Briefcase, DollarSign, Lightbulb, MapPin, Code, Clock } from "lucide-react"
import type { SoulFileData } from "@/lib/types"
import { cn } from "@/lib/utils"

const OBJECTIVES = [
  {
    id: "cofounder",
    icon: Rocket,
    title: "Find a Co-founder",
    description: "Technical or non-technical partner to build with",
  },
  {
    id: "hire",
    icon: Users,
    title: "Hire Talent",
    description: "Engineers, designers, or operators for your team",
  },
  {
    id: "job",
    icon: Briefcase,
    title: "Find a Role",
    description: "Your next career opportunity",
  },
  {
    id: "invest",
    icon: DollarSign,
    title: "Invest / Get Investment",
    description: "Angel investing or fundraising",
  },
  {
    id: "advise",
    icon: Lightbulb,
    title: "Advisory / Mentorship",
    description: "Give or receive guidance",
  },
  {
    id: "network",
    icon: Target,
    title: "General Networking",
    description: "Meet interesting people in your space",
  },
]

const SUGGESTED_LOCATIONS = ["North America", "Europe", "Remote", "San Francisco", "New York", "London", "Singapore"]
const SUGGESTED_SKILLS = ["React", "Python", "TypeScript", "AI/ML", "Product Management", "Go", "Rust", "Design"]

export function SettingsView() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "documents")
  
  // Mock data - in real app, fetch from database
  const [soulData, setSoulData] = useState<Partial<SoulFileData>>({
    documents: [],
    linkedinUrl: "",
    githubUrl: "",
    vibeCheck: "",
    objectives: [],
    filters: {
      locations: [],
      skills: [],
      experienceYears: 0,
    },
  })

  const [linkedinUrl, setLinkedinUrl] = useState(soulData.linkedinUrl || "")
  const [githubUrl, setGithubUrl] = useState(soulData.githubUrl || "")
  const [vibeCheck, setVibeCheck] = useState(soulData.vibeCheck || "")
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>(soulData.objectives || [])
  const [locations, setLocations] = useState<string[]>(soulData.filters?.locations || [])
  const [skills, setSkills] = useState<string[]>(soulData.filters?.skills || [])
  const [experienceYears, setExperienceYears] = useState(soulData.filters?.experienceYears || 0)
  const [locationInput, setLocationInput] = useState("")
  const [skillInput, setSkillInput] = useState("")

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  const toggleObjective = (id: string) => {
    setSelectedObjectives((prev) => {
      if (prev.includes(id)) {
        return prev.filter((o) => o !== id)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, id]
    })
  }

  const addLocation = (location: string) => {
    if (location && !locations.includes(location)) {
      setLocations((prev) => [...prev, location])
      setLocationInput("")
    }
  }

  const removeLocation = (location: string) => {
    setLocations((prev) => prev.filter((l) => l !== location))
  }

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills((prev) => [...prev, skill])
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const handleSave = () => {
    // In real app, save to database
    setSoulData({
      documents: soulData.documents,
      linkedinUrl,
      githubUrl,
      vibeCheck,
      objectives: selectedObjectives,
      filters: {
        locations,
        skills,
        experienceYears,
      },
    })
    // Show success message
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="bg-secondary/50 w-full justify-start overflow-x-auto">
        <TabsTrigger value="documents" className="gap-2">
          <FileText className="w-4 h-4" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="vibe" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Vibe Check
        </TabsTrigger>
        <TabsTrigger value="objectives" className="gap-2">
          <Target className="w-4 h-4" />
          Objectives
        </TabsTrigger>
        <TabsTrigger value="filters" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </TabsTrigger>
      </TabsList>

      <TabsContent value="documents" className="space-y-6">
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle>Documents & Links</CardTitle>
            <CardDescription>Update your LinkedIn, GitHub, and uploaded documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub URL
              </Label>
              <Input
                id="github"
                type="url"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="bg-secondary/50"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Label>Uploaded Documents</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  {soulData.documents?.length || 0} document(s) uploaded
                </p>
                {soulData.documents && soulData.documents.length > 0 ? (
                  <div className="space-y-2">
                    {soulData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{doc.name}</span>
                          <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                )}
              </div>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Upload className="w-4 h-4" />
                Upload Documents
              </Button>
            </div>

            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="vibe" className="space-y-6">
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle>Voice Signature</CardTitle>
            <CardDescription>Your Doppel uses this to communicate in your voice and style.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vibeCheck">Vibe Check</Label>
              <Textarea
                id="vibeCheck"
                placeholder="Write naturally. We'll analyze your tone, word choice, and style so your Doppel sounds like you."
                value={vibeCheck}
                onChange={(e) => setVibeCheck(e.target.value)}
                className="min-h-[200px] bg-secondary/50 resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{vibeCheck.length} characters</span>
                <span>{vibeCheck.length >= 100 ? "Looking good!" : `${100 - vibeCheck.length} more to go`}</span>
              </div>
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="objectives" className="space-y-6">
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle>Networking Objectives</CardTitle>
            <CardDescription>Select up to 3 objectives for your Doppel to focus on.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {OBJECTIVES.map((objective) => {
                const Icon = objective.icon
                const isSelected = selectedObjectives.includes(objective.id)
                return (
                  <button
                    key={objective.id}
                    onClick={() => toggleObjective(objective.id)}
                    disabled={!isSelected && selectedObjectives.length >= 3}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50",
                      !isSelected && selectedObjectives.length >= 3 && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", isSelected ? "bg-primary/20" : "bg-secondary")}>
                        <Icon className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{objective.title}</h3>
                        <p className="text-sm text-muted-foreground">{objective.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <span className="text-xs text-primary-foreground">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedObjectives.length} of 3 selected
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="filters" className="space-y-6">
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle>Gatekeeper Filters</CardTitle>
            <CardDescription>Define hard requirements. Your Doppel won't waste time on connections that don't meet these criteria.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <Label className="text-base font-medium">Locations</Label>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {locations.map((location) => (
                  <Badge key={location} variant="outline" className="gap-1">
                    {location}
                    <button
                      onClick={() => removeLocation(location)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add location..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addLocation(locationInput)
                    }
                  }}
                  className="bg-secondary/50"
                />
                <Button onClick={() => addLocation(locationInput)} variant="outline" className="bg-transparent">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_LOCATIONS.filter((loc) => !locations.includes(loc)).map((location) => (
                  <Button
                    key={location}
                    variant="outline"
                    size="sm"
                    onClick={() => addLocation(location)}
                    className="bg-transparent text-xs"
                  >
                    + {location}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-primary" />
                <Label className="text-base font-medium">Required Skills</Label>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="gap-1">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSkill(skillInput)
                    }
                  }}
                  className="bg-secondary/50"
                />
                <Button onClick={() => addSkill(skillInput)} variant="outline" className="bg-transparent">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.filter((skill) => !skills.includes(skill)).map((skill) => (
                  <Button
                    key={skill}
                    variant="outline"
                    size="sm"
                    onClick={() => addSkill(skill)}
                    className="bg-transparent text-xs"
                  >
                    + {skill}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <Label className="text-base font-medium">Minimum Experience Years</Label>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="bg-secondary/50 w-32"
                />
                <p className="text-sm text-muted-foreground">
                  {experienceYears === 0 ? "No minimum requirement" : `At least ${experienceYears} years of experience`}
                </p>
              </div>
            </div>

            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
