"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Bot, Bell, Shield, Trash2, Upload, RefreshCw, Target, MessageSquare, Globe } from "lucide-react"

export function SettingsView() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabParam || "profile")
  const [agentActive, setAgentActive] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)
  const [matchAlerts, setMatchAlerts] = useState(true)

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="bg-secondary/50 w-full justify-start overflow-x-auto">
        <TabsTrigger value="profile" className="gap-2">
          <User className="w-4 h-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="agent" className="gap-2">
          <Bot className="w-4 h-4" />
          Agent
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="privacy" className="gap-2">
          <Shield className="w-4 h-4" />
          Privacy
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details and public profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src="/diverse-avatars.png" />
                <AvatarFallback className="text-xl">JD</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Upload className="w-4 h-4" />
                  Change Photo
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
              </div>
            </div>

            <Separator />

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" className="bg-secondary/50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john@example.com" className="bg-secondary/50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Current Role</Label>
              <Input id="role" defaultValue="Founder & CEO" className="bg-secondary/50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" defaultValue="Stealth Startup" className="bg-secondary/50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input id="linkedin" placeholder="https://linkedin.com/in/..." className="bg-secondary/50" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github">GitHub URL</Label>
              <Input id="github" placeholder="https://github.com/..." className="bg-secondary/50" />
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Changes</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="agent" className="space-y-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Agent Configuration
            </CardTitle>
            <CardDescription>Control how your Doppel behaves and what it optimizes for.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div className="space-y-1">
                <p className="font-medium">Agent Status</p>
                <p className="text-sm text-muted-foreground">
                  {agentActive ? "Your Doppel is actively networking" : "Your Doppel is paused"}
                </p>
              </div>
              <Switch checked={agentActive} onCheckedChange={setAgentActive} />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <Label className="text-base font-medium">Networking Objectives</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary">Find Technical Co-founder</Badge>
                <Badge className="bg-primary/10 text-primary">Hire Senior Engineers</Badge>
                <Badge className="bg-primary/10 text-primary">Angel Investors</Badge>
                <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                  + Add Objective
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <Label className="text-base font-medium">Voice & Tone</Label>
              </div>
              <Textarea
                placeholder="Describe how you want your agent to communicate..."
                defaultValue="Professional but casual. Direct and to the point. Uses technical jargon when appropriate. Avoids emojis. Lowercase preferred."
                className="min-h-[100px] bg-secondary/50"
              />
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <RefreshCw className="w-4 h-4" />
                Regenerate from Vibe Check
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <Label className="text-base font-medium">Gatekeeper Filters</Label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Location</Label>
                  <Input defaultValue="North America, Europe" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Required Skills</Label>
                  <Input defaultValue="React, TypeScript, Go" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Min Match Score</Label>
                  <Input type="number" defaultValue="70" className="bg-secondary/50" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Max Simulations/Day</Label>
                  <Input type="number" defaultValue="50" className="bg-secondary/50" />
                </div>
              </div>
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Agent Settings</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Control how and when Doppel notifies you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div className="space-y-1">
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div className="space-y-1">
                <p className="font-medium">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">Summary of agent activity every Monday</p>
              </div>
              <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
              <div className="space-y-1">
                <p className="font-medium">High Match Alerts</p>
                <p className="text-sm text-muted-foreground">Instant notification for 90%+ matches</p>
              </div>
              <Switch checked={matchAlerts} onCheckedChange={setMatchAlerts} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="privacy" className="space-y-6">
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
            <CardDescription>Manage your data and account security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Data Management</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="gap-2 bg-transparent">
                  Export My Data
                </Button>
                <Button variant="outline" className="gap-2 bg-transparent">
                  Download Simulation History
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Danger Zone</h4>
              <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium text-destructive">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" className="gap-2 shrink-0">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
