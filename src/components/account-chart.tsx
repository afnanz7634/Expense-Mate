"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { Transaction } from "@/lib/types"
import { format, startOfMonth } from "date-fns"

interface AccountChartProps {
  transactions: Transaction[]
}

export function AccountChart({ transactions }: AccountChartProps) {
  // Calculate running balance by month
  const monthlyData = transactions.reduce(
    (acc, transaction) => {
      const monthKey = format(startOfMonth(new Date(transaction.date)), "MMM yyyy")

      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, balance: 0 }
      }

      if (transaction.type === "income") {
        acc[monthKey].balance += Number(transaction.amount)
      } else {
        acc[monthKey].balance -= Number(transaction.amount)
      }

      return acc
    },
    {} as Record<string, { month: string; balance: number }>,
  )

  const chartData = Object.values(monthlyData).map((data) => ({
    month: data.month,
    Balance: Number(data.balance.toFixed(2)),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Trend</CardTitle>
        <CardDescription>Account balance changes over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line type="monotone" dataKey="Balance" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No transaction data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
