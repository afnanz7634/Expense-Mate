"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, CategoryType } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

// Available color options
const colorOptions = [
  { value: "#ef4444", label: "Red" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#6b7280", label: "Gray" },
]

// Common categories by type
const commonExpenseCategories = [
  "Groceries",
  "Fuel",
  "Internet",
  "Electricity",
  "Rent",
  "Bills",
  "Snacks",
  "Shopping",
  "Healthcare",
  "Movies",
  "Food & Dining",
  "Entertainment",
  "Transportation",
  "Other"
]

const commonIncomeCategories = [
  "Salary",
  "Freelance",
  "Bonus",
  "Investments",
  "Client Work",
  "Side Projects",
  "Other Income"
]

interface CategoryDialogProps {
  open: boolean
  onClose: () => void
  category?: Category | null
}

export function CategoryDialog({ open, onClose, category }: CategoryDialogProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<CategoryType>("expense")
  const [color, setColor] = useState("#ef4444")
  const [parentId, setParentId] = useState<string | null>(null)
  const [availableParents, setAvailableParents] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadParentCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      console.error("Error loading parent categories:", error)
    } else if (data) {
      const filteredData = category
        ? data.filter((c) => c.id !== category.id && !isDescendant(c, category.id, data))
        : data
      setAvailableParents(filteredData)
    }
  }

  // Helper function to check if a category is a descendant of another
  const isDescendant = (cat: Category, ancestorId: string, allCategories: Category[]): boolean => {
    if (!cat.parent_id) return false
    if (cat.parent_id === ancestorId) return true
    const parent = allCategories.find((c) => c.id === cat.parent_id)
    return parent ? isDescendant(parent, ancestorId, allCategories) : false
  }

  useEffect(() => {
    if (open) {
      loadParentCategories()
    }
  }, [open, loadParentCategories])

  useEffect(() => {
    if (category) {
      setName(category.name)
      setType(category.type)
      setColor(category.color || "#ef4444")
      setParentId(category.parent_id)
    } else {
      setName("")
      setType("expense")
      setColor("#ef4444")
      setParentId(null)
    }
    setError(null)
  }, [category, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in")
      setLoading(false)
      return
    }

    if (category) {
      // Update existing category
      const { error: updateError } = await supabase
        .from("categories")
        .update({
          name,
          type,
          parent_id: parentId,
          ...(color && { color }),
        })
        .eq("id", category.id)

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
      } else {
        onClose()
      }
    } else {
      // Create new category
      const { error: insertError } = await supabase.from("categories").insert({
        user_id: user.id,
        name,
        type,
        parent_id: parentId,
        ...(color && { color }),
      })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
      } else {
        onClose()
      }
    }

    setLoading(false)
  }

  const quickList = type === "income" ? commonIncomeCategories : commonExpenseCategories

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit Category" : "Create New Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update the category details" : "Add a new category for your transactions"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          {/* Category Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="e.g., Groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* 👇 Quick Select Common Categories */}
          {quickList.length > 0 && (
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="flex flex-wrap gap-2">
                {quickList.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`rounded-full border px-3 py-1 text-sm transition-all ${
                      name === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setName(cat)}
                    disabled={loading}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as CategoryType)} disabled={loading}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Parent Category */}
          <div className="space-y-2">
            <Label htmlFor="parent">Parent Category (Optional)</Label>
            <Select
              value={parentId || "none"}
              onValueChange={(value) => setParentId(value === "none" ? null : value)}
              disabled={loading}
            >
              <SelectTrigger id="parent">
                <SelectValue placeholder="Select a parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Parent (Top Level)</SelectItem>
                {availableParents
                  .filter((p) => p.type === type && (!category || p.id !== category.id))
                  .map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Select value={color} onValueChange={setColor} disabled={loading}>
              <SelectTrigger id="color">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: option.value }} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? "Update" : "Create"}
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
