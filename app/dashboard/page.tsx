import { DashboardShell } from "@/components/dashboard/shell"
import { NetworkGraph } from "@/components/dashboard/network-graph"
import { ConnectionsList } from "@/components/dashboard/connections-list"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { AgentStatus } from "@/components/dashboard/agent-status"

export const metadata = {
  title: "Dashboard | Doppel",
  description: "Your agent networking dashboard",
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text">
            Network Overview
          </h1>
          <p className="text-muted-foreground">Your Doppel is exploring. Here&apos;s what it&apos;s found so far.</p>
        </div>

        <AgentStatus />
        <StatsCards />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <NetworkGraph />
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-5">
            <ConnectionsList />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
