"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import type { Category } from "@/lib/types"
import { CategoryDialog } from "@/components/category-dialog"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import { CategoryList } from "@/components/category-list"
import { toast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useCategoryStore } from "@/lib/stores/category-store"

export default function CategoriesPage() {
  const { categories, loadCategories, removeCategory } = useCategoryStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setDialogOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeletingCategory(id)
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)

    // First check if category has any transactions
    const { data: transactions, error: queryError } = await supabase
      .from("transactions")
      .select("id")
      .eq("category_id", id)
      .limit(1)

    if (queryError) {
      toast({
        title: "Error",
        description: "Error checking transactions: " + queryError.message,
        variant: "destructive",
      })
      setIsDeleting(false)
      setDeletingCategory(null)
      return
    }

    if (transactions && transactions.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "Category has transactions. Please delete or reassign them first.",
        variant: "destructive",
      })
      setIsDeleting(false)
      setDeletingCategory(null)
      return
    }

    // Also check if category has any child categories
    const { data: children, error: childrenError } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", id)
      .limit(1)

    if (childrenError) {
      toast({
        title: "Error",
        description: "Error checking child categories: " + childrenError.message,
        variant: "destructive",
      })
      setIsDeleting(false)
      setDeletingCategory(null)
      return
    }

    if (children && children.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "Category has subcategories. Please delete them first.",
        variant: "destructive",
      })
      setIsDeleting(false)
      setDeletingCategory(null)
      return
    }

    const { error: deleteError } = await supabase.from("categories").delete().eq("id", id)

    if (deleteError) {
      toast({
        title: "Error",
        description: "Error deleting category: " + deleteError.message,
        variant: "destructive",
      })
    } else {
      removeCategory(id)
      toast({
        title: "Success",
        description: "Category deleted successfully",
      })
    }

    setIsDeleting(false)
    setDeletingCategory(null)
  }

  // Split categories by type
  const incomeCategories = categories.filter((c) => c.type === "income")
  const expenseCategories = categories.filter((c) => c.type === "expense")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income Categories</CardTitle>
            <Badge variant="secondary">{incomeCategories.length}</Badge>
          </CardHeader>
          <CardContent>
            {incomeCategories.length > 0 ? (
              <CategoryList
                categories={incomeCategories}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No income categories yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Categories</CardTitle>
            <Badge variant="secondary">{expenseCategories.length}</Badge>
          </CardHeader>
          <CardContent>
            {expenseCategories.length > 0 ? (
              <CategoryList
                categories={expenseCategories}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ) : (
              <p className="text-sm text-muted-foreground">No expense categories yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <CategoryDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false)
          setEditingCategory(null)
        }}
        category={editingCategory}
      />

      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={() => deletingCategory && handleDelete(deletingCategory)}
        loading={isDeleting}
      />
    </div>
  )
}
