"use client"

import { useState } from "react"
import type { Category, CategoryWithChildren } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { ScrollArea } from "./scroll-area"

interface TreeSelectProps {
  value: string | null | undefined
  onChange: (value: string | null) => void
  categories: Category[]
  placeholder?: string
  disabled?: boolean
  /** if true → only leaf nodes selectable; if false → all nodes selectable */
  selectOnlyLeaf?: boolean
}

// Convert flat categories to hierarchical structure
function buildCategoryTree(categories: Category[]): CategoryWithChildren[] {
  const categoryMap = new Map<string, CategoryWithChildren>()
  
  // Create map entries
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] })
  })
  
  // Link parent-child
  const rootCategories: CategoryWithChildren[] = []
  categories.forEach(cat => {
    const category = categoryMap.get(cat.id)!
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id)
      if (parent && parent.children) {
        parent.children.push(category)
      }
    } else {
      rootCategories.push(category)
    }
  })
  
  return rootCategories
}

function CategoryNode({
  category,
  level = 0,
  onSelect,
  selectedValue,
  selectOnlyLeaf
}: { 
  category: CategoryWithChildren
  level?: number
  onSelect: (id: string) => void
  selectedValue?: string | null
  selectOnlyLeaf?: boolean
}) {
  const hasChildren = category.children && category.children.length > 0
  const paddingLeft = `${(level * 12) + 12}px`
  const isSelected = category.id === selectedValue

  // --- Case 1: Leaf node ---
  if (!hasChildren) {
    return (
      <CommandItem
        value={category.id}
        onSelect={() => onSelect(category.id)}
        className="cursor-pointer"
      >
        <div className="flex items-center gap-2" style={{ paddingLeft }}>
          <Check
            className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
          />
          <div
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color || "#6b7280" }}
          />
          <span>{category.name}</span>
        </div>
      </CommandItem>
    )
  }

  // --- Case 2: Parent node ---
  return (
    <>
      <CommandItem
        value={category.id}
        className={cn(
          "font-medium ",
          selectOnlyLeaf ? "cursor-default text-muted-foreground" : "cursor-pointer"
        )}
        onSelect={() => {
          if (!selectOnlyLeaf) onSelect(category.id)
        }}
      >
        <div className="flex items-center gap-2" style={{ paddingLeft }}>
          <Check
            className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
          />
          <div
            className={`h-2 w-2 rounded-full flex-shrink-0 ${selectOnlyLeaf ? 'opacity-50' : ''}`}
            style={{ backgroundColor: category.color || "#6b7280" }}
          />
          <span>{category.name}</span>
        </div>
      </CommandItem>

      {category.children?.map(child => (
        <CategoryNode
          key={child.id}
          category={child}
          level={level + 1}
          onSelect={onSelect}
          selectedValue={selectedValue}
          selectOnlyLeaf={selectOnlyLeaf}
        />
      ))}
    </>
  )
}

export function TreeSelect({
  value,
  onChange,
  categories,
  placeholder = "Select a category",
  disabled = false,
  selectOnlyLeaf = false
}: TreeSelectProps) {
  const [open, setOpen] = useState(false)
  const categoryTree = buildCategoryTree(categories)

  const getCategoryPath = (categoryId: string | null): Category[] => {
    if (!categoryId) return []
    const category = categories.find(c => c.id === categoryId)
    if (!category) return []
    if (!category.parent_id) return [category]
    return [...getCategoryPath(category.parent_id), category]
  }

  const selectedCategoryPath = getCategoryPath(value ?? null)

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="flex items-center gap-2 w-full justify-between">
            {value === null ? (
              <span>No Parent (Top Level)</span>
            ) : selectedCategoryPath.length > 0 ? (
              <span className="flex items-center gap-2">
                {selectedCategoryPath.map((cat, index) => (
                  <span key={cat.id} className="flex items-center gap-2">
                    {index > 0 && <span className="text-muted-foreground">/</span>}
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color || "#6b7280" }}
                      />
                      <span>{cat.name}</span>
                    </span>
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 relative z-[9999]">
        <Command>
          <CommandGroup>
            <ScrollArea className="h-64">
              <CommandItem
                value="none"
                onSelect={() => {
                  onChange(null)
                  setOpen(false)
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2 pl-3">
                  <Check
                    className={cn(
                      "h-4 w-4",
                      value === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>No Parent (Top Level)</span>
                </div>
              </CommandItem>

              {categoryTree.map(category => (
                <CategoryNode
                  key={category.id}
                  category={category}
                  selectedValue={value}
                  selectOnlyLeaf={selectOnlyLeaf}
                  onSelect={(id) => {
                    onChange(id)
                    setOpen(false)
                  }}
                />
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
