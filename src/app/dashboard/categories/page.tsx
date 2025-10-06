"use client"


import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import type { Category, CategoryWithChildren } from "@/lib/types"
import { CategoryDialog } from "@/components/category-dialog"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabaseClient"
import { CategoryTree } from "@/components/category-tree"
import { toast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useCategoryStore } from "@/lib/stores/category-store"

export default function CategoriesPage() {
  const { categories, loadCategories } = useCategoryStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // const buildCategoryTree = (categories: Category[]): CategoryWithChildren[] => {
  //   const categoryMap = new Map<string, CategoryWithChildren>();
  //   const rootCategories: CategoryWithChildren[] = [];

  //   // First pass: Create category objects
  //   categories.forEach(cat => {
  //     categoryMap.set(cat.id, { ...cat, children: [] });
  //   });

  //   // Second pass: Build the tree
  //   categories.forEach(cat => {
  //     const category = categoryMap.get(cat.id)!;
  //     if (cat.parent_id) {
  //       const parent = categoryMap.get(cat.parent_id);
  //       if (parent) {
  //         parent.children?.push(category);
  //       }
  //     } else {
  //       rootCategories.push(category);
  //     }
  //   });

  //   return rootCategories;
  // };

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
      toast({
        title: "Error",
        description: "Error checking transactions: " + queryError.message,
        variant: "destructive",
      });
      setIsDeleting(false);
      setDeletingCategory(null);
      return;
    }

    if (transactions && transactions.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "Category has transactions. Please delete or reassign them first.",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Error checking child categories: " + childrenError.message,
        variant: "destructive",
      });
      setIsDeleting(false);
      setDeletingCategory(null);
      return;
    }

    if (children && children.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "Category has subcategories. Please delete them first.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setDeletingCategory(null);
      return;
    }

    // If no transactions and no children, proceed with deletion
    const { error: deleteError } = await supabase.from("categories").delete().eq("id", id)
    if (deleteError) {
      toast({
        title: "Error",
        description: "Error deleting category: " + deleteError.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
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

  // Count total categories including children
  const countCategories = (categories: CategoryWithChildren[]): number => {
    return categories.reduce((acc, category) => {
      return acc + 1 + (category.children ? countCategories(category.children) : 0);
    }, 0);
  };

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>All Categories</span>
            <Badge variant="secondary">
              {countCategories(categories)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length > 0 ? (
            <CategoryTree
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">No categories yet</p>
          )}
        </CardContent>
      </Card>

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
