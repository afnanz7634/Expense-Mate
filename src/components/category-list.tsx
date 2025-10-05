"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, Pencil, Trash2 } from "lucide-react"
import type { CategoryWithChildren } from "@/lib/types"

interface CategoryListProps {
  categories: CategoryWithChildren[]
  onEdit: (category: CategoryWithChildren) => void
  onDelete: (id: string) => void
  level?: number
}

export function CategoryList({ categories, onEdit, onDelete, level = 0 }: CategoryListProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => {
        const hasChildren = category.children && category.children.length > 0
        const isExpanded = expandedCategories.has(category.id)

        return (
          <div key={category.id} className="space-y-2">
            <div
              className="flex items-center justify-between rounded-lg border p-3"
              style={{ marginLeft: `${level * 1.5}rem` }}
            >
              <div className="flex items-center gap-3">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0"
                    onClick={() => toggleExpand(category.id)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: category.color || "#6b7280" }}
                />
                <span>{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
            {hasChildren && isExpanded && category.children && (
              <CategoryList
                categories={category.children}
                onEdit={onEdit}
                onDelete={onDelete}
                level={level + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
