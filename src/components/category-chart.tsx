"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Transaction, Category } from "@/lib/types"

interface TransactionWithCategory extends Transaction {
  category: Category
}

interface CategoryChartProps {
  transactions: TransactionWithCategory[]
}

export function CategoryChart({ transactions }: CategoryChartProps) {
  // Group expenses by category
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, transaction) => {
        const categoryName = transaction.category.name
        const categoryColor = transaction.category.color || "#6b7280"

        if (!acc[categoryName]) {
          acc[categoryName] = { name: categoryName, value: 0, color: categoryColor }
        }

        acc[categoryName].value += Number(transaction.amount)

        return acc
      },
      {} as Record<string, { name: string; value: number; color: string }>,
    )

  const chartData = Object.values(expensesByCategory).map((data) => ({
    name: data.name,
    value: Number(data.value.toFixed(2)),
    color: data.color,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Breakdown of your spending this month</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No expense data for this month
          </div>
        )}
      </CardContent>
    </Card>
  )
}
