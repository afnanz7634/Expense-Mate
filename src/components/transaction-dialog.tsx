"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TreeSelect } from "@/components/ui/tree-select"
import type { Transaction, Account, Category, TransactionType } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { useAccountStore } from "@/lib/stores/account-store"

interface TransactionDialogProps {
  open: boolean
  onClose: () => void
  transaction?: Transaction | null
}

export function TransactionDialog({ open, onClose, transaction }: TransactionDialogProps) {
  const [accountId, setAccountId] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<TransactionType>("expense")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
   const [parentId, setParentId] = useState<string | null>(null)
   const {loadAccounts: loadAccountsInStore} = useAccountStore()

  useEffect(() => {
    if (open) {
      loadAccounts()
      loadCategories()
    }
  }, [open])

  useEffect(() => {
    if (transaction) {
      setAccountId(transaction.account_id)
      setParentId(transaction.category_id)
      setAmount(transaction.amount.toString())
      setType(transaction.type)
      setDescription(transaction.description || "")
      setDate(transaction.date)
    } else {
      setAccountId("")
      setParentId(null)
      setAmount("")
      setType("expense")
      setDescription("")
      setDate(new Date().toISOString().split("T")[0])
    }
  }, [transaction, open])

  const loadAccounts = async () => {
    const { data, error } = await supabase.from("accounts").select("*").order("name", { ascending: true })
    if (error) {
      console.error("Error loading accounts:", error.message)
    } else if (data) {
      loadAccountsInStore()
      setAccounts(data)
      if (!transaction && data.length > 0) {
        setAccountId(data[0].id)
      }
    }
  }

  const loadCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true })
    if (error) {
      console.error("Error loading categories:", error.message)
    } else if (data) {
      setCategories(data)
    }
  }

  const filteredCategories = categories.filter((c) => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (!parentId) {
      toast({
        title: "Validation Error",
        description: "Please select a category",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (transaction) {
      // Update existing transaction
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          account_id: accountId,
          category_id: parentId,
          amount: Number.parseFloat(amount),
          type,
          description,
          date,
        })
        .eq("id", transaction.id)

      if (updateError) {
        toast({
          title: "Error",
          description: updateError.message,
          variant: "destructive",
        })
        setLoading(false)
      } else {
        await loadAccounts()
        toast({
          title: "Success",
          description: "Transaction updated successfully",
        })
        onClose()
      }
    } else {
      // Create new transaction
      const { error: insertError } = await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: accountId,
        category_id: parentId,
        amount: Number.parseFloat(amount),
        type,
        description,
        date,
      })

      if (insertError) {
        toast({
          title: "Error",
          description: insertError.message,
          variant: "destructive",
        })
        setLoading(false)
      } else {
        await loadAccounts()
        toast({
          title: "Success",
          description: "Transaction created successfully",
        })
        onClose()
      }
    }

    setLoading(false)
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
                      <Label htmlFor="parent">Category</Label>
                      <TreeSelect
                        value={parentId}
                        onChange={setParentId}
                        categories={categories.filter(c => c.type === type )}
                        placeholder="Select a parent category"
                        disabled={loading}
                        selectOnlyLeaf={true}
                      />
                    </div>
          {/* <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <TreeSelect
              value={parentId}
              onChange={setParentId}
              categories={filteredCategories}
              placeholder="Select a category"
              disabled={loading}
              selectOnlyLeaf={false}
            />
          </div> */}
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
