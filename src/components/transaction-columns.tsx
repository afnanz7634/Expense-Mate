"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { format } from "date-fns"
import type { Transaction, Account, Category } from "@/lib/types"

interface TransactionWithDetails extends Transaction {
  account: Account
  category: Category
}

interface TransactionColumnsProps {
  onEdit: (transaction: TransactionWithDetails) => void
  onDelete: (id: string) => void
  allCategories?: Category[]
}

export const createTransactionColumns = ({ onEdit, onDelete, allCategories }: TransactionColumnsProps): ColumnDef<TransactionWithDetails>[] => {
  
  // Helper function to get category path
  const getCategoryPath = (category: Category): Category[] => {
    if (!category.parent_id || !allCategories) return [category]
    
    const parent = allCategories.find(c => c.id === category.parent_id)
    if (!parent) return [category]
    
    return [...getCategoryPath(parent), category]
  }

  return [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return format(new Date(row.getValue("date")), "MMM dd, yyyy")
    },
  },
  {
    id: "category",
    accessorFn: (row) => row.category.name,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const category = row.original.category
      const categoryPath = getCategoryPath(category)
      
      return (
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color || "#6b7280" }}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-sm">
              {categoryPath.map((cat, index) => (
                <span key={cat.id} className="flex items-center gap-1">
                  {index > 0 && <span className="text-muted-foreground">→</span>}
                  <span className={index === categoryPath.length - 1 ? "font-medium" : "text-muted-foreground"}>
                    {cat.name}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    id: "account",
    accessorFn: (row) => row.account.name,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Account
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const account = row.original.account
      return (
        <div className="flex flex-col">
          <span className="font-medium">{account.name}</span>
          <span className="text-xs text-muted-foreground capitalize">{account.type}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      const categoryName = row.original.category.name
      return (
        <div className="max-w-[200px]">
          <div className="font-medium truncate">
            {description || categoryName}
          </div>
          {description && description !== categoryName && (
            <div className="text-xs text-muted-foreground truncate">
              {categoryName}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge 
          variant={type === "income" ? "default" : "destructive"}
          className={type === "income" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
        >
          {type === "income" ? "Income" : "Expense"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 hover:bg-transparent"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const type = row.getValue("type") as string
      const currency = row.original.account.currency

      return (
        <div className="text-right font-medium">
          <span className={type === "income" ? "text-green-600" : "text-red-600"}>
            {type === "income" ? "+" : "-"}{currency} {amount.toFixed(2)}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const transaction = row.original

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(transaction)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(transaction.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
}