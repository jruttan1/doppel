"use client";

import { useState, useEffect, useRef } from "react";
import { useSimulation, type SimulationStatus } from "@/hooks/useSimulation";
import { ThoughtHeader } from "./ThoughtHeader";
import { ConnectionSnapshot } from "./ConnectionSnapshot";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Radio, ArrowLeft, Bot, Sparkles, User } from "lucide-react";
import { getAgentThought } from "@/lib/flavor-text";
import type { AgentPersona, TranscriptEntry } from "@/lib/graph/simulation/types";

interface SimulationFeedProps {
  simulationId: string | null;
  persona: AgentPersona;
  partnerName: string;
  partnerRole?: string;
  className?: string;
}

// Scanning flavor text
const SCANNING_THOUGHTS = [
  "Scanning the network for interesting people...",
  "Analyzing professional backgrounds...",
  "Looking for shared interests...",
  "Evaluating potential connections...",
  "Cross-referencing skills and goals...",
  "Searching for complementary expertise...",
  "Mapping the professional landscape...",
];

// Discovery flavor text
const DISCOVERY_THOUGHTS = [
  "Found someone interesting...",
  "Detected a potential match...",
  "Interesting profile detected...",
  "This looks promising...",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Scanning/idle state component
function ScanningState({ persona }: { persona: AgentPersona }) {
  const [thought, setThought] = useState(getRandomItem(SCANNING_THOUGHTS));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setThought(getRandomItem(SCANNING_THOUGHTS));
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 animate-fadeIn">
      {/* Radar animation */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full border-2 border-primary/30 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div
            className="absolute inset-3 rounded-full border border-primary/10 animate-ping"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute inset-6 rounded-full border border-primary/5 animate-ping"
            style={{ animationDelay: "1s" }}
          />
          <Search className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Status text */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">Exploring Network</h3>
        <p
          className={`text-sm text-muted-foreground transition-opacity duration-300 max-w-xs ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {thought}
        </p>
      </div>

      {/* Agent indicator */}
      <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
        <div className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </div>
        <span className="text-xs text-primary font-medium">Agent Active</span>
      </div>
    </div>
  );
}

// Discovery state - found someone, about to start conversation
function DiscoveryState({ partnerName, partnerRole }: { partnerName: string; partnerRole?: string }) {
  const [thought] = useState(getRandomItem(DISCOVERY_THOUGHTS));

  const initials = partnerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 animate-fadeIn">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse scale-150" />
        <Avatar className="w-20 h-20 border-2 border-primary/50 relative">
          <AvatarFallback className="text-xl bg-primary/20 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-primary-foreground" />
        </div>
      </div>

      <h3 className="text-lg font-medium text-foreground mb-1">{partnerName}</h3>
      {partnerRole && <p className="text-sm text-muted-foreground mb-4">{partnerRole}</p>}

      <Badge className="bg-primary/20 text-primary border-primary/30 animate-pulse">
        {thought}
      </Badge>

      <p className="text-xs text-muted-foreground mt-6">Starting conversation...</p>
    </div>
  );
}

// Chat message bubble
function ChatMessage({
  entry,
  isUserAgent,
  userName,
  partnerName,
}: {
  entry: TranscriptEntry;
  isUserAgent: boolean;
  userName: string;
  partnerName: string;
}) {
  const initials = (isUserAgent ? userName : partnerName)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`flex gap-3 animate-slideIn ${isUserAgent ? "flex-row-reverse" : ""}`}
    >
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback
          className={`text-xs ${
            isUserAgent ? "bg-primary/20 text-primary" : "bg-secondary text-foreground"
          }`}
        >
          {isUserAgent ? <Bot className="w-4 h-4" /> : initials}
        </AvatarFallback>
      </Avatar>
      <div
        className={`max-w-[80%] p-3 rounded-2xl ${
          isUserAgent
            ? "bg-primary/10 border border-primary/20 rounded-tr-sm"
            : "bg-secondary rounded-tl-sm"
        }`}
      >
        <p className="text-sm text-foreground/90 leading-relaxed">{entry.text}</p>
      </div>
    </div>
  );
}

// Typing indicator
function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex gap-3 animate-fadeIn">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarFallback className="text-xs bg-secondary">
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1">
          <span
            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

// Running state with chat
function RunningState({
  transcript,
  persona,
  partnerName,
  isWaitingForReply,
}: {
  transcript: TranscriptEntry[];
  persona: AgentPersona;
  partnerName: string;
  isWaitingForReply: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const userName = persona.identity?.name || persona.name || "You";

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript.length]);

  // Determine if user's agent sent the last message
  const lastSpeakerId = transcript[transcript.length - 1]?.id;
  const isUserAgentTurn = lastSpeakerId !== persona.id;

  return (
    <div className="flex flex-col h-full">
      {/* Thought header - show when waiting for user's agent to reply */}
      <div className="shrink-0 mb-3">
        <ThoughtHeader persona={persona} isThinking={isUserAgentTurn && isWaitingForReply} />
      </div>

      {/* Header with partner info */}
      <div className="shrink-0 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-[10px] bg-secondary">
              {partnerName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{partnerName}</span>
        </div>
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
          <Radio className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Chat log */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="space-y-4 pr-4">
          {transcript.map((entry, i) => {
            const isUserAgent = entry.id === persona.id;
            return (
              <ChatMessage
                key={`${entry.timestamp}-${i}`}
                entry={entry}
                isUserAgent={isUserAgent}
                userName={userName}
                partnerName={partnerName}
              />
            );
          })}
          {/* Show typing indicator when waiting */}
          {isWaitingForReply && !isUserAgentTurn && (
            <TypingIndicator name={partnerName} />
          )}
        </div>
      </ScrollArea>

      {/* Message count */}
      <div className="shrink-0 pt-3 mt-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {transcript.length} messages exchanged
        </p>
      </div>
    </div>
  );
}

// Main component
export function SimulationFeed({
  simulationId,
  persona,
  partnerName,
  partnerRole,
  className = "",
}: SimulationFeedProps) {
  const { simulation, status, transcript, analysis, isLoading } = useSimulation(simulationId);
  const [viewMode, setViewMode] = useState<"snapshot" | "transcript">("snapshot");
  const [prevTranscriptLength, setPrevTranscriptLength] = useState(0);
  const [showDiscovery, setShowDiscovery] = useState(false);

  // Track if we're waiting for a reply (no new message in last few seconds)
  const [isWaitingForReply, setIsWaitingForReply] = useState(false);

  // Show discovery state briefly when a new simulation starts
  useEffect(() => {
    if (simulationId && status === "running" && transcript.length === 0) {
      setShowDiscovery(true);
      const timer = setTimeout(() => setShowDiscovery(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [simulationId, status, transcript.length]);

  useEffect(() => {
    if (transcript.length > prevTranscriptLength) {
      // New message arrived
      setIsWaitingForReply(false);
      setPrevTranscriptLength(transcript.length);
      setShowDiscovery(false);

      // After a short delay, indicate waiting
      const timer = setTimeout(() => {
        if (status === "running") {
          setIsWaitingForReply(true);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [transcript.length, prevTranscriptLength, status]);

  // Reset view mode when simulation completes
  useEffect(() => {
    if (status === "completed") {
      setViewMode("snapshot");
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Idle/Searching state */}
      {(status === "idle" || !simulationId) && <ScanningState persona={persona} />}

      {/* Discovery state - found someone */}
      {status === "running" && showDiscovery && (
        <DiscoveryState partnerName={partnerName} partnerRole={partnerRole} />
      )}

      {/* Running state - active conversation */}
      {status === "running" && !showDiscovery && transcript.length > 0 && (
        <RunningState
          transcript={transcript}
          persona={persona}
          partnerName={partnerName}
          isWaitingForReply={isWaitingForReply}
        />
      )}

      {/* Running but no messages yet (still initializing) */}
      {status === "running" && !showDiscovery && transcript.length === 0 && (
        <DiscoveryState partnerName={partnerName} partnerRole={partnerRole} />
      )}

      {/* Completed state */}
      {status === "completed" && analysis && (
        <>
          {viewMode === "snapshot" ? (
            <ConnectionSnapshot
              partnerName={partnerName}
              partnerRole={partnerRole}
              score={analysis.score}
              takeaways={analysis.takeaways}
              onViewTranscript={() => setViewMode("transcript")}
            />
          ) : (
            <div className="flex flex-col h-full">
              {/* Back button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("snapshot")}
                className="self-start mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Summary
              </Button>

              {/* Full transcript */}
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {transcript.map((entry, i) => {
                    const isUserAgent = entry.id === persona.id;
                    return (
                      <ChatMessage
                        key={`${entry.timestamp}-${i}`}
                        entry={entry}
                        isUserAgent={isUserAgent}
                        userName={persona.identity?.name || persona.name || "You"}
                        partnerName={partnerName}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}
        </>
      )}
    </div>
  );
}
