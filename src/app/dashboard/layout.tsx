import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabaseServer"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {

  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
