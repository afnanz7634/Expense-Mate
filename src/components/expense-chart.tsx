"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { Transaction } from "@/lib/types"
import { format, startOfMonth } from "date-fns"

interface ExpenseChartProps {
  transactions: Transaction[]
}

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  // Group transactions by month
  const monthlyData = transactions.reduce(
    (acc, transaction) => {
      const monthKey = format(startOfMonth(new Date(transaction.date)), "MMM yyyy")

      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0, expenses: 0 }
      }

      if (transaction.type === "income") {
        acc[monthKey].income += Number(transaction.amount)
      } else {
        acc[monthKey].expenses += Number(transaction.amount)
      }

      return acc
    },
    {} as Record<string, { month: string; income: number; expenses: number }>,
  )

  const chartData = Object.values(monthlyData).map((data) => ({
    month: data.month,
    Income: Number(data.income.toFixed(2)),
    Expenses: Number(data.expenses.toFixed(2)),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Monthly comparison over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
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
            <Legend />
            <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
