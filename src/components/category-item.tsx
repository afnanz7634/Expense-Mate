"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ChevronRight, ChevronDown } from "lucide-react"
import type { CategoryWithChildren } from "@/lib/types"
import { useState } from "react"

interface CategoryItemProps {
  category: CategoryWithChildren
  onEdit: (category: CategoryWithChildren) => void
  onDelete: (id: string) => void
  level: number
}

export function CategoryItem({ category, onEdit, onDelete, level }: CategoryItemProps) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = category.children && category.children.length > 0

  return (
    <div className="space-y-2">
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
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
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
      
      {expanded && hasChildren && (
        <div className="space-y-2">
          {category.children?.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
