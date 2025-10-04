export type AccountType = "checking" | "savings" | "credit" | "cash" | "investment"
export type CategoryType = "income" | "expense"
export type TransactionType = "income" | "expense"

export interface Account {
  id: string
  user_id: string
  name: string
  type: AccountType
  balance: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  type: CategoryType
  color: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  category_id: string
  amount: number
  type: TransactionType
  description: string | null
  date: string
  created_at: string
  updated_at: string
}

export interface TransactionWithDetails extends Transaction {
  account: Account
  category: Category
}
