import { notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabaseServer"
import { AccountPageClient } from "./page.client"

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single()

  if (!account) {
    notFound()
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("account_id", id)
    .order("date", { ascending: false })

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const { data: chartTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", id)
    .gte("date", sixMonthsAgo.toISOString().split("T")[0])
    .order("date", { ascending: true })

  return (
    <AccountPageClient 
      account={account} 
      transactions={transactions || []} 
      chartTransactions={chartTransactions || []} 
    />
  )
}
