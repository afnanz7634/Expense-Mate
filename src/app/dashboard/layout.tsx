import type React from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // TODO: Add Supabase authentication check here
  // Example:
  // const supabase = await createServerClient(...)
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) {
  //   redirect("/auth/login")
  // }

  // Placeholder user for development
  const user = {
    id: "placeholder-user-id",
    email: "user@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
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
