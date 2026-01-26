"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react";

interface ConnectionSnapshotProps {
  partnerName: string;
  partnerRole?: string;
  score: number;
  takeaways: string[];
  onViewTranscript: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-teal-400";
  if (score >= 40) return "text-yellow-400";
  return "text-orange-400";
}

function getScoreGradient(score: number): string {
  if (score >= 80) return "from-green-500/20 to-teal-500/20";
  if (score >= 60) return "from-teal-500/20 to-cyan-500/20";
  if (score >= 40) return "from-yellow-500/20 to-orange-500/20";
  return "from-orange-500/20 to-red-500/20";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Potential";
  return "Low Match";
}

export function ConnectionSnapshot({
  partnerName,
  partnerRole,
  score,
  takeaways,
  onViewTranscript,
}: ConnectionSnapshotProps) {
  const initials = partnerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Generate headline from first takeaway or default
  const headline =
    takeaways.length > 0
      ? takeaways[0].length > 60
        ? takeaways[0].slice(0, 60) + "..."
        : takeaways[0]
      : `Connected with ${partnerName}`;

  return (
    <div className="animate-fadeIn">
      <div
        className={`relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${getScoreGradient(
          score
        )} p-6`}
      >
        {/* Success indicator */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        </div>

        {/* Partner info */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-14 h-14 border-2 border-primary/30">
            <AvatarFallback className="text-lg bg-primary/20 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{partnerName}</h3>
            {partnerRole && (
              <p className="text-sm text-muted-foreground">{partnerRole}</p>
            )}
          </div>
        </div>

        {/* Score display */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </span>
              <span className="text-lg text-muted-foreground">Match</span>
            </div>
            <p className={`text-sm ${getScoreColor(score)} mt-1`}>
              {getScoreLabel(score)}
            </p>
          </div>
          <div className="w-24 h-24 relative">
            {/* Circular progress indicator */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${score * 2.51} 251`}
                className={getScoreColor(score)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className={`w-6 h-6 ${getScoreColor(score)}`} />
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-4 p-3 rounded-lg bg-background/50 border border-border">
          <p className="text-sm text-foreground font-medium">{headline}</p>
        </div>

        {/* Takeaways */}
        {takeaways.length > 1 && (
          <div className="space-y-2 mb-6">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Key Takeaways
            </h4>
            <ul className="space-y-1.5">
              {takeaways.slice(1, 4).map((takeaway, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <ArrowRight className="w-3 h-3 mt-1 text-primary shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action button */}
        <Button
          onClick={onViewTranscript}
          variant="outline"
          className="w-full bg-background/50 hover:bg-background/80"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          View Full Transcript
        </Button>
      </div>
    </div>
  );
}
