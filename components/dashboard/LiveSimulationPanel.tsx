"use client";

import { useState, useEffect } from "react";
import { SimulationFeed } from "./SimulationFeed";
import { useActiveSimulation } from "@/hooks/useSimulation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio, Loader2 } from "lucide-react";
import type { AgentPersona } from "@/lib/graph/simulation/types";

interface PartnerInfo {
  id: string;
  name: string;
  role?: string;
}

export function LiveSimulationPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [persona, setPersona] = useState<AgentPersona | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const supabase = createClient();

  // Fetch current user and their persona
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setUserId(user.id);

        const { data: userData } = await supabase
          .from("users")
          .select("id, name, persona")
          .eq("id", user.id)
          .single();

        if (userData?.persona) {
          setPersona({
            id: userData.id,
            name: userData.name || "You",
            ...userData.persona,
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [supabase]);

  // Get the active simulation
  const { simulationId, simulation, status, isLoading } = useActiveSimulation(userId);

  // Fetch partner info when simulation changes
  useEffect(() => {
    if (!simulation || !userId) return;

    const fetchPartner = async () => {
      const partnerId = simulation.participant1 === userId
        ? simulation.participant2
        : simulation.participant1;

      const { data: partner } = await supabase
        .from("users")
        .select("id, name, tagline, persona")
        .eq("id", partnerId)
        .single();

      if (partner) {
        const partnerPersona = partner.persona as any;
        const identity = partnerPersona?.identity || {};
        const role = identity?.role || partner.tagline?.split("@")[0]?.trim() || "";
        const company = identity?.company || partner.tagline?.split("@")[1]?.split("|")[0]?.trim() || "";

        setPartnerInfo({
          id: partner.id,
          name: partner.name || "Unknown",
          role: company ? `${role} @ ${company}` : role,
        });
      }
    };

    fetchPartner();
  }, [simulation, userId, supabase]);

  if (isLoadingUser || isLoading) {
    return (
      <Card className="h-full border-border bg-card/50">
        <CardContent className="h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!persona) {
    return (
      <Card className="h-full border-border bg-card/50">
        <CardContent className="h-full flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Complete onboarding to see live simulations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-border bg-card/50 flex flex-col overflow-hidden">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          Live Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden">
        <SimulationFeed
          simulationId={simulationId}
          persona={persona}
          partnerName={partnerInfo?.name || "Searching..."}
          partnerRole={partnerInfo?.role}
          className="h-full"
        />
      </CardContent>
    </Card>
  );
}
