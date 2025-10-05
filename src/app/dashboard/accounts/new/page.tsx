"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import type { AccountType } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"
import { useAccountStore } from "@/lib/stores/account-store"
import { toast } from "@/components/ui/use-toast"

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
  { value: "credit", label: "Credit Card" },
  { value: "cash", label: "Cash" },
  { value: "investment", label: "Investment" },
]

export default function NewAccountPage() {
  const [name, setName] = useState("")
  const [type, setType] = useState<AccountType>("checking")
  const [balance, setBalance] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { addAccount } = useAccountStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const { data: newAccount, error: insertError } = await supabase
      .from("accounts")
      .insert({
        user_id: user.id,
        name,
        type,
        balance: Number.parseFloat(balance) || 0,
        currency,
      })
      .select()
      .single()

    if (insertError) {
      toast({
        title: "Error",
        description: insertError.message,
        variant: "destructive",
      })
      setLoading(false)
    } else if (newAccount) {
      addAccount(newAccount)
      toast({
        title: "Success",
        description: "Account created successfully",
      })
      router.push("/dashboard")
    }

    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create New Account</CardTitle>
          <CardDescription>Add a new account to track your finances</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Account Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as AccountType)} disabled={loading}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((accountType) => (
                    <SelectItem key={accountType.value} value={accountType.value}>
                      {accountType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="balance">Initial Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency} disabled={loading}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="PKR">PKR</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
