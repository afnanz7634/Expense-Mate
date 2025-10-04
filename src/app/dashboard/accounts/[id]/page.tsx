import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { AccountChart } from "@/components/account-chart"
import { getSupabaseServerClient } from "@/lib/supabaseServer"

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
    .limit(10)

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const { data: chartTransactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", id)
    .gte("date", sixMonthsAgo.toISOString().split("T")[0])
    .order("date", { ascending: true })

  // const account: any = null
  // const transactions: any[] = []
  // const chartTransactions: any[] = []

  // if (!account) {
  //   notFound()
  // }

  const totalIncome =
    transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const totalExpenses =
    transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{account.name}</h1>
          <p className="text-muted-foreground capitalize">{account.type} Account</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {account.currency} {Number(account.balance).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <AccountChart transactions={chartTransactions || []} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: transaction.category.color || "#6b7280" }}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="h-5 w-5 text-white" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || transaction.category.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{transaction.category.name}</span>
                        <span>•</span>
                        <span>{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}${Number(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
