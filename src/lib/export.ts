import type { Transaction, Account, Category } from "./types"
import { format } from "date-fns"

interface TransactionWithDetails extends Transaction {
  account: Account
  category: Category
}

export function exportToCSV(transactions: TransactionWithDetails[]) {
  // Define CSV headers
  const headers = ["Date", "Type", "Account", "Category", "Amount", "Description"]

  // Convert transactions to CSV rows
  const rows = transactions.map((transaction) => [
    format(new Date(transaction.date), "yyyy-MM-dd"),
    transaction.type,
    transaction.account.name,
    transaction.category.name,
    transaction.amount.toString(),
    transaction.description || "",
  ])

  // Combine headers and rows
  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
