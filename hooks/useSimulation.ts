"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TranscriptEntry, AnalysisResult } from "@/lib/graph/simulation/types";

export interface SimulationData {
  id: string;
  participant1: string;
  participant2: string;
  transcript: TranscriptEntry[];
  score: number | null;
  takeaways: string[] | null;
  created_at: string;
}

export type SimulationStatus = "idle" | "running" | "completed";

export interface UseSimulationReturn {
  simulation: SimulationData | null;
  status: SimulationStatus;
  transcript: TranscriptEntry[];
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for real-time simulation data with Supabase Realtime subscription
 */
export function useSimulation(simulationId: string | null): UseSimulationReturn {
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  // Derive status from simulation data
  const status: SimulationStatus = (() => {
    if (!simulation) return "idle";
    if (!simulation.transcript || simulation.transcript.length === 0) return "idle";
    if (simulation.score === null) return "running";
    return "completed";
  })();

  // Extract transcript and analysis
  const transcript = simulation?.transcript || [];
  const analysis: AnalysisResult | null =
    simulation?.score !== null && simulation?.score !== undefined
      ? {
          score: simulation.score,
          takeaways: simulation.takeaways || [],
        }
      : null;

  // Fetch simulation data
  const fetchSimulation = useCallback(async () => {
    if (!simulationId) {
      setSimulation(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from("simulations")
        .select("id, participant1, participant2, transcript, score, takeaways, created_at")
        .eq("id", simulationId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setSimulation(data as SimulationData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch simulation"));
    } finally {
      setIsLoading(false);
    }
  }, [simulationId, supabase]);

  // Initial fetch
  useEffect(() => {
    fetchSimulation();
  }, [fetchSimulation]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!simulationId) return;

    const channel = supabase
      .channel(`simulation-${simulationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "simulations",
          filter: `id=eq.${simulationId}`,
        },
        (payload) => {
          const newData = payload.new as SimulationData;
          setSimulation(newData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [simulationId, supabase]);

  return {
    simulation,
    status,
    transcript,
    analysis,
    isLoading,
    error,
    refetch: fetchSimulation,
  };
}

/**
 * Hook to find the most recent active simulation for a user
 * Automatically follows the sequential simulation flow
 */
export function useActiveSimulation(userId: string | null): UseSimulationReturn & {
  simulationId: string | null;
} {
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  const supabase = createClient();

  // Find the most recent simulation (running first, then most recent completed)
  const findActiveSimulation = async () => {
    if (!userId) return null;

    try {
      // First try to find a running simulation (no score yet)
      const { data: running } = await supabase
        .from("simulations")
        .select("id")
        .eq("participant1", userId)
        .is("score", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (running) {
        return running.id;
      }

      // Fall back to most recent simulation
      const { data: recent } = await supabase
        .from("simulations")
        .select("id")
        .eq("participant1", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return recent?.id || null;
    } catch (err) {
      console.error("Error finding active simulation:", err);
      return null;
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!userId) {
      setIsSearching(false);
      return;
    }

    findActiveSimulation().then((id) => {
      setSimulationId(id);
      setIsSearching(false);
    });
  }, [userId]);

  // Subscribe to simulation changes
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-simulations-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "simulations",
          filter: `participant1=eq.${userId}`,
        },
        (payload) => {
          // New simulation started, switch to it immediately
          const newSim = payload.new as { id: string };
          console.log("New simulation detected:", newSim.id);
          setSimulationId(newSim.id);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "simulations",
          filter: `participant1=eq.${userId}`,
        },
        async (payload) => {
          const updated = payload.new as { id: string; score: number | null };

          // If current simulation just got a score (completed),
          // wait a moment then check for the next one
          if (updated.id === simulationId && updated.score !== null) {
            console.log("Simulation completed, checking for next...");
            // Give time to show the completion state before moving on
            setTimeout(async () => {
              const nextId = await findActiveSimulation();
              if (nextId && nextId !== simulationId) {
                console.log("Found next simulation:", nextId);
                setSimulationId(nextId);
              }
            }, 5000); // Show completion for 5 seconds
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, simulationId, supabase]);

  const simulationData = useSimulation(simulationId);

  return {
    ...simulationData,
    simulationId,
    isLoading: isSearching || simulationData.isLoading,
  };
}
