"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Download } from "lucide-react"
import type { Transaction, Account, Category } from "@/lib/types"
import { TransactionDialog } from "@/components/transaction-dialog"
import { exportToCSV } from "@/lib/export"
import { supabase } from "@/lib/supabaseClient"
import { useAccountStore } from "@/lib/stores/account-store"
import { useCategoryStore } from "@/lib/stores/category-store"
import { DataTable } from "@/components/ui/data-table"
import { createTransactionColumns } from "@/components/transaction-columns"

interface TransactionWithDetails extends Transaction {
  account: Account
  category: Category
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const { accounts, loadAccounts } = useAccountStore()
  const { categories, loadCategories } = useCategoryStore()

  useEffect(() => {
    loadTransactions()
    loadAccounts()
    loadCategories()
  }, [])

  useEffect(() => {
    setFilteredTransactions(transactions)
  }, [transactions])

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
      loadAccounts()
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

  const handleEdit = (transaction: TransactionWithDetails) => {
    setEditingTransaction(transaction)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingTransaction(null)
    loadTransactions()
  }

  const handleFilter = (filters: {
    accountId?: string
    categoryId?: string
    type?: string
    startDate?: string
    endDate?: string
  }) => {
    let filtered = [...transactions]

    if (filters.accountId && filters.accountId !== "all") {
      filtered = filtered.filter(t => t.account_id === filters.accountId)
    }

    if (filters.categoryId && filters.categoryId !== "all") {
      // Filter by category and its children
      const categoryIds = getCategoryAndChildren(filters.categoryId)
      filtered = filtered.filter(t => categoryIds.includes(t.category_id))
    }

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type)
    }

    if (filters.startDate) {
      filtered = filtered.filter(t => t.date >= filters.startDate!)
    }

    if (filters.endDate) {
      filtered = filtered.filter(t => t.date <= filters.endDate!)
    }

    setFilteredTransactions(filtered)
  }

  // Helper function to get category and all its children
  const getCategoryAndChildren = (categoryId: string): string[] => {
    const result = [categoryId]
    const flatCategories = getAllCategories(categories)
    
    const addChildren = (parentId: string) => {
      const children = flatCategories.filter(c => c.parent_id === parentId)
      children.forEach(child => {
        result.push(child.id)
        addChildren(child.id)
      })
    }
    
    addChildren(categoryId)
    return result
  }

  // Helper function to flatten category tree
  const getAllCategories = (categoryTree: any[]): Category[] => {
    const result: Category[] = []
    
    const flatten = (cats: any[]) => {
      cats.forEach(cat => {
        result.push(cat)
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children)
        }
      })
    }
    
    flatten(categoryTree)
    return result
  }

  const handleExport = () => {
    exportToCSV(filteredTransactions)
  }

  const columns = createTransactionColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    allCategories: getAllCategories(categories),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View and manage all your transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={filteredTransactions.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Transactions</span>
            {filteredTransactions.length !== transactions.length && (
              <span className="text-sm font-normal text-muted-foreground">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredTransactions} 
              searchPlaceholder="Search transactions..."
              searchColumn="description"
              enableFilters={true}
              filterOptions={{
                accounts: accounts.map(account => ({
                  id: account.id,
                  name: account.name
                })),
                categories: getAllCategories(categories),
                types: [
                  { value: "income", label: "Income" },
                  { value: "expense", label: "Expense" }
                ]
              }}
              onFilter={handleFilter}
            />
          )}
        </CardContent>
      </Card>

      <TransactionDialog open={dialogOpen} onClose={handleDialogClose} transaction={editingTransaction} />
    </div>
  )
}
