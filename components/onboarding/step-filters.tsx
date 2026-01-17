"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowRight, Filter, MapPin, Code, Clock, X } from "lucide-react"
import type { SoulFileData } from "@/lib/types"

interface StepFiltersProps {
  soulData: Partial<SoulFileData>
  updateSoulData: (data: Partial<SoulFileData>) => void
  onNext: () => void
  onPrev: () => void
}

const SUGGESTED_LOCATIONS = ["North America", "Europe", "Remote", "San Francisco", "New York", "London", "Singapore"]
const SUGGESTED_SKILLS = ["React", "Python", "TypeScript", "AI/ML", "Product Management", "Go", "Rust", "Design"]

export function StepFilters({ soulData, updateSoulData, onNext, onPrev }: StepFiltersProps) {
  const [locations, setLocations] = useState<string[]>(soulData.filters?.locations || [])
  const [skills, setSkills] = useState<string[]>(soulData.filters?.skills || [])
  const [experienceYears, setExperienceYears] = useState(soulData.filters?.experienceYears || 0)
  const [locationInput, setLocationInput] = useState("")
  const [skillInput, setSkillInput] = useState("")

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

  const handleNext = () => {
    updateSoulData({
      filters: {
        locations,
        skills,
        experienceYears,
      },
    })
    onNext()
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">Gatekeeper</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Set Your Filters</h1>
        <p className="text-muted-foreground">
          Define hard requirements. Your Doppel won&apos;t waste time on connections that don&apos;t meet these
          criteria.
        </p>
      </div>

      <div className="space-y-6">
        {/* Location Filter */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location Preferences
            </CardTitle>
            <CardDescription>Where should your connections be based?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a location..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLocation(locationInput)}
                className="bg-input border-border"
              />
              <Button variant="outline" onClick={() => addLocation(locationInput)} className="shrink-0 bg-transparent">
                Add
              </Button>
            </div>

            {locations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {locations.map((location) => (
                  <Badge key={location} variant="secondary" className="gap-1 pr-1">
                    {location}
                    <button
                      onClick={() => removeLocation(location)}
                      className="ml-1 p-0.5 hover:bg-background/50 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Suggestions</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_LOCATIONS.filter((l) => !locations.includes(l)).map((location) => (
                  <Badge
                    key={location}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => addLocation(location)}
                  >
                    + {location}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Filter */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              Required Skills
            </CardTitle>
            <CardDescription>What skills are you looking for?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill(skillInput)}
                className="bg-input border-border"
              />
              <Button variant="outline" onClick={() => addSkill(skillInput)} className="shrink-0 bg-transparent">
                Add
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-1 p-0.5 hover:bg-background/50 rounded">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Suggestions</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => addSkill(skill)}
                  >
                    + {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience Filter */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Minimum Experience
            </CardTitle>
            <CardDescription>How many years of experience should connections have?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{experienceYears}+ years</span>
              <Badge variant="outline">{experienceYears === 0 ? "Any experience" : `${experienceYears}+ years`}</Badge>
            </div>
            <Slider
              value={[experienceYears]}
              onValueChange={([value]) => setExperienceYears(value)}
              max={15}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Any</span>
              <span>15+ years</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
