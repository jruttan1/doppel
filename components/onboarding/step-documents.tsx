"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Github, Linkedin, Upload, X, ArrowRight, CheckCircle2 } from "lucide-react"
import type { SoulFileData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StepDocumentsProps {
  soulData: Partial<SoulFileData>
  updateSoulData: (data: Partial<SoulFileData>) => void
  onNext: () => void
}

export function StepDocuments({ soulData, updateSoulData, onNext }: StepDocumentsProps) {
  const [linkedinUrl, setLinkedinUrl] = useState(soulData.linkedinUrl || "")
  const [githubUrl, setGithubUrl] = useState(soulData.githubUrl || "")
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf" || file.type.includes("document"),
    )
    setUploadedFiles((prev) => [...prev, ...files])
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    updateSoulData({
      linkedinUrl,
      githubUrl,
      documents: uploadedFiles.map((f) => ({ name: f.name, type: "resume" })),
    })
    onNext()
  }

  const isValid = uploadedFiles.length > 0 || linkedinUrl || githubUrl

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Feed Your Soul File</h1>
        <p className="text-muted-foreground">
          Upload your documents and connect your profiles. The more data, the better your Doppel knows you.
        </p>
      </div>

      <div className="space-y-6">
        {/* File Upload */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Resume / Documents
            </CardTitle>
            <CardDescription>Upload your resume, cover letters, or any document that describes you.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-secondary/30",
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={handleFileInput}
              />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOC up to 10MB</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* LinkedIn */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              LinkedIn Profile
            </CardTitle>
            <CardDescription>We&apos;ll extract your experience and connections.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="linkedin" className="sr-only">
              LinkedIn URL
            </Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/in/yourprofile"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="bg-input border-border"
            />
          </CardContent>
        </Card>

        {/* GitHub */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub Profile
            </CardTitle>
            <CardDescription>Showcase your technical work and open source contributions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="github" className="sr-only">
              GitHub URL
            </Label>
            <Input
              id="github"
              placeholder="https://github.com/yourusername"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="bg-input border-border"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
