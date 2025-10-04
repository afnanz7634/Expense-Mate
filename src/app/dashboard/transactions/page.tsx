"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2, Download } from "lucide-react"
import type { Transaction, Account, Category } from "@/lib/types"
import { TransactionDialog } from "@/components/transaction-dialog"
import { TransactionFilters } from "@/components/transaction-filter"
import { format } from "date-fns"
import { exportToCSV } from "@/lib/export"
import { supabase } from "@/lib/supabaseClient"

interface TransactionWithDetails extends Transaction {
  account: Account
  category: Category
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("transactions")
      .select("*, account:accounts(*), category:categories(*)")
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error.message)
    } else if (data) {
      setTransactions(data as TransactionWithDetails[])
    }

    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (error) {
      console.error('Error Deleting Transaction:', error.message);
    } else {
      loadTransactions()
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingTransaction(null)
    loadTransactions()
  }

  const handleFilter = async (filters: {
    accountId?: string
    categoryId?: string
    type?: string
    startDate?: string
    endDate?: string
  }) => {
    setLoading(true)

    let query = supabase
      .from("transactions")
      .select("*, account:accounts(*), category:categories(*)")
      .order("date", { ascending: false })

    if (filters.accountId && filters.accountId !== "all") {
      query = query.eq("account_id", filters.accountId)
    }

    if (filters.categoryId && filters.categoryId !== "all") {
      query = query.eq("category_id", filters.categoryId)
    }

    if (filters.type && filters.type !== "all") {
      query = query.eq("type", filters.type)
    }

    if (filters.startDate) {
      query = query.gte("date", filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte("date", filters.endDate)
    }

    const { data, error } = await query
    if (error) {
      console.error("Error filtering transactions:", error.message)
    } else if (data) {
      setTransactions(data as TransactionWithDetails[])
    }

    setLoading(false)
  }

  const handleExport = () => {
    exportToCSV(transactions)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage all your transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={transactions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <TransactionFilters onFilter={handleFilter} />

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: transaction.category.color || "#6b7280" }}
                    >
                      <span className="text-white text-xs font-bold">
                        {transaction.category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description || transaction.category.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{transaction.account.name}</span>
                        <span>•</span>
                        <span>{transaction.category.name}</span>
                        <span>•</span>
                        <span>{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`text-lg font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}${Number(transaction.amount).toFixed(2)}
                    </p>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(transaction)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(transaction.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDialog open={dialogOpen} onClose={handleDialogClose} transaction={editingTransaction} />
    </div>
  )
}
