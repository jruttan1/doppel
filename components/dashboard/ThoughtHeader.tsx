"use client";

import { useState, useEffect } from "react";
import { getAgentThought } from "@/lib/flavor-text";
import type { AgentPersona } from "@/lib/graph/simulation/types";

interface ThoughtHeaderProps {
  persona: AgentPersona;
  isThinking: boolean;
}

export function ThoughtHeader({ persona, isThinking }: ThoughtHeaderProps) {
  const [thought, setThought] = useState(() => getAgentThought(persona));
  const [isVisible, setIsVisible] = useState(true);

  // Cycle through thoughts every 3 seconds while thinking
  useEffect(() => {
    if (!isThinking) return;

    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);

      // Change thought after fade out
      setTimeout(() => {
        setThought(getAgentThought(persona));
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [isThinking, persona]);

  if (!isThinking) return null;

  return (
    <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-black/40 backdrop-blur-sm">
      {/* Animated border gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 animate-shimmer" />

      <div className="relative px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Pulsing indicator */}
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </div>

          {/* Thought text */}
          <div className="flex-1 font-mono text-sm">
            <span className="text-primary/70">[AGENT_THOUGHT]:</span>{" "}
            <span
              className={`text-foreground/90 transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {thought}
            </span>
            {/* Blinking cursor */}
            <span className="animate-blink text-primary">_</span>
          </div>
        </div>
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-8 animate-scan" />
      </div>
    </div>
  );
}
