"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Category } from "@/lib/types"
import { CategoryDialog } from "@/components/category-dialog"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)

    const { data, error } = await supabase.from("categories").select("*").order("type", { ascending: true })
    if (error) {
      console.error('Error Fetching Categories:', error.message);
    } else if (data) {
      setCategories(data as Category[])
    }

    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    const { error } = await supabase.from("categories").delete().eq("id", id)
    if (error) {
        console.error('Error Deleting Category:', error.message);
    } else {
        loadCategories()
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingCategory(null)
    loadCategories()
  }

  const incomeCategories = categories.filter((c) => c.type === "income")
  const expenseCategories = categories.filter((c) => c.type === "expense")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage your income and expense categories</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-green-600">Income Categories</span>
              <Badge variant="secondary">{incomeCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeCategories.length > 0 ? (
              <div className="space-y-2">
                {incomeCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color || "#22c55e" }} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">No income categories yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-red-600">Expense Categories</span>
              <Badge variant="secondary">{expenseCategories.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseCategories.length > 0 ? (
              <div className="space-y-2">
                {expenseCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: category.color || "#ef4444" }} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">No expense categories yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <CategoryDialog open={dialogOpen} onClose={handleDialogClose} category={editingCategory} />
    </div>
  )
}
