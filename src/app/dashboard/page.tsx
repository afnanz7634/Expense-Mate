import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryChart } from "@/components/category-chart"
import { getSupabaseServerClient } from "@/lib/supabaseServer"

export default async function DashboardPage() {

    const supabase = await getSupabaseServerClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return <div className="p-6"> Not authorized </div>
    }

    const { data: accounts } = await supabase.from("accounts").select("*").eq("user_id", user.id).order("created_at", { ascending: true })

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
    const endOfMonth = new Date().toISOString().split("T")[0]

    const { data: transactions } = await supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .gte("date", startOfMonth)
      .lte("date", endOfMonth)

    // Fetch all categories for hierarchical display
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true })

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const { data: chartTransactions } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", sixMonthsAgo.toISOString().split("T")[0])
      .order("date", { ascending: true })

    //   const accounts: any[] = []
    //   const transactions: any[] = []
    //   const chartTransactions: any[] = []

    const totalBalance = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0
    const monthlyIncome =
        transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0) || 0
    const monthlyExpenses =
        transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0) || 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your finances</p>
                </div>
                <Link href="/dashboard/accounts/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Account
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">Across {accounts?.length || 0} accounts</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${monthlyIncome.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">${monthlyExpenses.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1">
                <ExpenseChart transactions={chartTransactions || []} />
                <CategoryChart 
                    transactions={transactions || []} 
                    categories={categories || []}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    {accounts && accounts.length > 0 ? (
                        <div className="space-y-3">
                            {accounts.map((account) => (
                                <Link key={account.id} href={`/dashboard/accounts/${account.id}`}>
                                    <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                                        <div>
                                            <p className="font-medium">{account.name}</p>
                                            <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">
                                                {account.currency} {Number(account.balance).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">No accounts yet</p>
                            <Link href="/dashboard/accounts/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Account
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
