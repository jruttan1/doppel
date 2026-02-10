import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/shell"
import { SettingsView } from "@/components/dashboard/settings-view"

export const metadata = {
  title: "Settings | Doppels",
  description: "Manage your Doppel settings",
}

export default async function SettingsPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from("users")
    .select("ingestion_status")
    .eq("id", user.id)
    .single()

  if (!profile || profile.ingestion_status !== "complete") {
    if (profile?.ingestion_status === "processing") {
      redirect("/creating")
    }
    redirect("/onboarding")
  }

  return (
    <DashboardShell>
      <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your profile, agent behavior, and preferences.</p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <SettingsView />
          </Suspense>
        </div>
      </div>
    </DashboardShell>
  )
}
