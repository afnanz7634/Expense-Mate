"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Category, CategoryWithChildren } from "@/lib/types"
import { CategoryDialog } from "@/components/category-dialog"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import { CategoryItem } from "@/components/category-item"
import { toast } from "react-toastify"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const buildCategoryTree = (categories: Category[]): CategoryWithChildren[] => {
    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // First pass: Create category objects
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: Build the tree
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children?.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  };

  const loadCategories = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("type", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error('Error Fetching Categories:', error.message);
    } else if (data) {
      setCategories(data as Category[])
    }

    setLoading(false)
  }

  const handleDeleteClick = (id: string) => {
    setDeletingCategory(id);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);

    // First check if category has any transactions
    const { data: transactions, error: queryError } = await supabase
      .from("transactions")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (queryError) {
      toast.error("Error checking transactions: " + queryError.message);
      setIsDeleting(false);
      setDeletingCategory(null);
      return;
    }

    if (transactions && transactions.length > 0) {
      toast.error("Cannot delete this category because it has transactions. Please delete or reassign the transactions first.");
      setIsDeleting(false);
      setDeletingCategory(null);
      return;
    }

    // Also check if category has any child categories
    const { data: children, error: childrenError } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", id)
      .limit(1);

    if (childrenError) {
      toast.error("Error checking child categories: " + childrenError.message);
      setIsDeleting(false);
      setDeletingCategory(null);
      return;
    }

    if (children && children.length > 0) {
      toast.error("Cannot delete this category because it has subcategories. Please delete the subcategories first.");
      setIsDeleting(false);
      setDeletingCategory(null);
      return;
    }

    // If no transactions and no children, proceed with deletion
    const { error: deleteError } = await supabase.from("categories").delete().eq("id", id)
    if (deleteError) {
      toast.error("Error deleting category: " + deleteError.message);
    } else {
      toast.success("Category deleted successfully");
      loadCategories();
    }
    
    setIsDeleting(false);
    setDeletingCategory(null);
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
                {buildCategoryTree(incomeCategories).map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    level={0}
                  />
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
                {buildCategoryTree(expenseCategories).map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    level={0}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">No expense categories yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <CategoryDialog open={dialogOpen} onClose={handleDialogClose} category={editingCategory} />
      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        loading={isDeleting}
        variant="destructive"
        onConfirm={() => deletingCategory && handleDelete(deletingCategory)}
      />
    </div>
  )
}
