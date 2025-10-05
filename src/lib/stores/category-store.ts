import { create } from "zustand"
import type { Category, CategoryWithChildren } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"

interface CategoryStore {
  categories: CategoryWithChildren[]
  loadCategories: () => Promise<void>
  addCategory: (category: Category) => void
  updateCategory: (category: Category) => void
  removeCategory: (categoryId: string) => void
  getCategoryTree: () => CategoryWithChildren[]
}

const buildCategoryTree = (categories: Category[]): CategoryWithChildren[] => {
  const categoryMap = new Map<string, CategoryWithChildren>()
  const roots: CategoryWithChildren[] = []

  // First pass: Create all category objects
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] })
  })

  // Second pass: Build the tree structure
  categories.forEach(category => {
    const currentCategory = categoryMap.get(category.id)!
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id)
      if (parent) {
        parent.children?.push(currentCategory)
      }
    } else {
      roots.push(currentCategory)
    }
  })

  return roots
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],

  loadCategories: async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true })

    if (data) {
      const categoryTree = buildCategoryTree(data)
      set({ categories: categoryTree })
    }
  },

  addCategory: (category: Category) => {
    set((state) => {
      const allCategories = getAllCategories(state.categories)
      allCategories.push(category)
      return { categories: buildCategoryTree(allCategories) }
    })
  },

  updateCategory: (category: Category) => {
    set((state) => {
      const allCategories = getAllCategories(state.categories).map(c => 
        c.id === category.id ? category : c
      )
      return { categories: buildCategoryTree(allCategories) }
    })
  },

  removeCategory: (categoryId: string) => {
    set((state) => {
      const allCategories = getAllCategories(state.categories).filter(c => 
        c.id !== categoryId
      )
      return { categories: buildCategoryTree(allCategories) }
    })
  },

  getCategoryTree: () => {
    return get().categories
  }
}))

// Helper function to flatten the category tree
const getAllCategories = (categories: CategoryWithChildren[]): Category[] => {
  const result: Category[] = []
  const traverse = (category: CategoryWithChildren) => {
    // Omit the children property when adding to result
    const { children, ...categoryWithoutChildren } = category
    result.push(categoryWithoutChildren)
    children?.forEach(traverse)
  }
  categories.forEach(traverse)
  return result
}
