import { create } from "zustand"
import type { Account } from "@/lib/types"
import { supabase } from "@/lib/supabaseClient"

interface AccountStore {
  accounts: Account[]
  loadAccounts: () => Promise<void>
  addAccount: (account: Account) => void
  removeAccount: (accountId: string) => void
}

export const useAccountStore = create<AccountStore>((set) => ({
  accounts: [],

  loadAccounts: async () => {
    const { data } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: true })

    if (data) {
      set({ accounts: data })
    }
  },

  addAccount: (account: Account) => {
    set((state) => ({
      accounts: [...state.accounts, account]
    }))
  },

  removeAccount: (accountId: string) => {
    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== accountId)
    }))
  }
}))
