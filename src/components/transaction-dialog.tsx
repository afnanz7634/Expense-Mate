"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Transaction, Account, Category, TransactionType } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface TransactionDialogProps {
  open: boolean
  onClose: () => void
  transaction?: Transaction | null
}

export function TransactionDialog({ open, onClose, transaction }: TransactionDialogProps) {
  const [accountId, setAccountId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<TransactionType>("expense")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    if (open) {
      loadAccounts()
      loadCategories()
    }
  }, [open])

  useEffect(() => {
    if (transaction) {
      setAccountId(transaction.account_id)
      setCategoryId(transaction.category_id)
      setAmount(transaction.amount.toString())
      setType(transaction.type)
      setDescription(transaction.description || "")
      setDate(transaction.date)
    } else {
      setAccountId("")
      setCategoryId("")
      setAmount("")
      setType("expense")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])
    }
    setError(null)
  }, [transaction, open])

  const loadAccounts = async () => {
    // TODO: Replace with your database query
    // const { data } = await supabase.from("accounts").select("*").order("name", { ascending: true })
    // if (data) {
    //   setAccounts(data)
    //   if (!transaction && data.length > 0) {
    //     setAccountId(data[0].id)
    //   }
    // }
  }

  const loadCategories = async () => {
    // TODO: Replace with your database query
    // const { data } = await supabase.from("categories").select("*").order("name", { ascending: true })
    // if (data) {
    //   setCategories(data)
    // }
  }

  const filteredCategories = categories.filter((c) => c.type === type)

  useEffect(() => {
    if (filteredCategories.length > 0 && !transaction) {
      setCategoryId(filteredCategories[0].id)
    }
  }, [type, filteredCategories, transaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // TODO: Replace with your auth and database logic
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser()

    // if (!user) {
    //   setError("You must be logged in")
    //   setLoading(false)
    //   return
    // }

    // if (transaction) {
    //   // Update existing transaction
    //   const { error: updateError } = await supabase
    //     .from("transactions")
    //     .update({
    //       account_id: accountId,
    //       category_id: categoryId,
    //       amount: Number.parseFloat(amount),
    //       type,
    //       description,
    //       date,
    //     })
    //     .eq("id", transaction.id)

    //   if (updateError) {
    //     setError(updateError.message)
    //     setLoading(false)
    //   } else {
    //     onClose()
    //   }
    // } else {
    //   // Create new transaction
    //   const { error: insertError } = await supabase.from("transactions").insert({
    //     user_id: user.id,
    //     account_id: accountId,
    //     category_id: categoryId,
    //     amount: Number.parseFloat(amount),
    //     type,
    //     description,
    //     date,
    //   })

    //   if (insertError) {
    //     setError(insertError.message)
    //     setLoading(false)
    //   } else {
    //     onClose()
    //   }
    // }

    setLoading(false)
    setError("Database not connected. Please add your database integration.")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{transaction ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription>
            {transaction ? "Update the transaction details" : "Record a new income or expense"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as TransactionType)} disabled={loading}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <Select value={accountId} onValueChange={setAccountId} disabled={loading}>
              <SelectTrigger id="account">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={loading}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color || "#6b7280" }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {transaction ? "Update" : "Add"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
