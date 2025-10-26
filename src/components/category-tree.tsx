"use client"

import { Button } from "./ui/button"
import { Pencil, Trash2 } from "lucide-react"
import type { CategoryWithChildren } from "@/lib/types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface CategoryTreeProps {
  categories: CategoryWithChildren[]
  onEdit: (category: CategoryWithChildren) => void
  onDelete: (id: string) => void
}

function CategoryNode({ category }: { 
  category: CategoryWithChildren
  onEdit: (category: CategoryWithChildren) => void
  onDelete: (id: string) => void 
}) {
  // const isIncome = category.type === "income"
  
  return (
    <div className="relative flex items-center gap-3 py-1.5 flex-1">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: category.color || "#6b7280" }}
        />
        <span className="text-foreground truncate">
          {category.name}
        </span>
      </div>
    </div>
  )
}

function CategoryBranch({ category, level = 0, onEdit, onDelete }: { 
  category: CategoryWithChildren
  level?: number
  onEdit: (category: CategoryWithChildren) => void
  onDelete: (id: string) => void
}) {
  const hasChildren = category.children && category.children.length > 0

  const ActionButtons = () => (
    <div className="flex items-center gap-0.5 ml-auto">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 hover:bg-accent"
        onClick={(e) => { e.stopPropagation(); onEdit(category); }}
      >
        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-7 w-7 hover:bg-accent"
        onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  )

  if (!hasChildren) {
    return (
      <div className="ml-4 flex items-center pr-2">
        <div className="w-4" /> {/* Spacer to align with accordion items */}
        <CategoryNode 
          category={category} 
          onEdit={onEdit} 
          onDelete={onDelete}
        />
        <ActionButtons />
      </div>
    )
  }

  return (
    <div className="ml-4">
      <div className="flex items-center pr-2 group">
        <Accordion type="multiple" className="flex-1">
          <AccordionItem value={category.id} className="border-none">
            <AccordionTrigger 
              className={cn(
                "p-0 hover:no-underline",
                "data-[state=open]:pb-0",
                "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground/50",
                "[&>svg]:transition-transform"
              )}
            >
              <CategoryNode 
                category={category} 
                onEdit={onEdit} 
                onDelete={onDelete}
              />
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0">
              <div className="ml-[7px] border-l-2 border-muted pl-4">
                {category.children?.map(child => (
                  <CategoryBranch
                    key={child.id}
                    category={child}
                    level={level + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <ActionButtons />
      </div>
    </div>
  )
}

export function CategoryTree({ categories, onEdit, onDelete }: CategoryTreeProps) {
  // Get root categories (those without parent_id)
  const rootCategories = categories.filter(c => !c.parent_id)
  const expenseCategories = rootCategories.filter(c => c.type === "expense")
  const incomeCategories = rootCategories.filter(c => c.type === "income")

  return (
    <div className="space-y-6">
      {/* Expense Categories */}
      {expenseCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-red-500/70 mb-3 pl-1">Expense Categories</h3>
          <div>
            {expenseCategories.map(category => (
              <CategoryBranch
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Income Categories */}
      {incomeCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-green-500/70 mb-3 pl-1">Income Categories</h3>
          <div>
            {incomeCategories.map(category => (
              <CategoryBranch
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
