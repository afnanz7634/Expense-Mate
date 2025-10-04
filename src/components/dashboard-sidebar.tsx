"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Wallet, Tag, Receipt, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from "react"
import type { Account } from "@/lib/types"

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Transactions",
    href: "/dashboard/transactions",
    icon: Receipt,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: Tag,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    // TODO: Replace with your database query
    // const { data } = await supabase.from("accounts").select("*").order("created_at", { ascending: true })
    // if (data) {
    //   setAccounts(data)
    // }
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <Wallet className="h-6 w-6" />
          <span>ExpenseMate</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </div>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between px-3">
            <h3 className="text-xs font-semibold uppercase text-sidebar-foreground/70">Accounts</h3>
            <Link href="/dashboard/accounts/new">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-1">
            {accounts.map((account) => (
              <Link
                key={account.id}
                href={`/dashboard/accounts/${account.id}`}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  pathname === `/dashboard/accounts/${account.id}`
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70",
                )}
              >
                <span className="truncate">{account.name}</span>
                <span className="text-xs font-medium">
                  {account.currency} {account.balance.toFixed(2)}
                </span>
              </Link>
            ))}
            {accounts.length === 0 && <p className="px-3 py-2 text-xs text-sidebar-foreground/50">No accounts yet</p>}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
