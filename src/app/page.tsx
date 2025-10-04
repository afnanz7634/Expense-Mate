import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet, TrendingUp, PieChart, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Wallet className="h-6 w-6" />
            <span>ExpenseMate</span>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-balance">
            Take Control of Your Finances with ExpenseMate
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground text-pretty">
            Track expenses, manage multiple accounts, and gain insights into your spending habits with our powerful
            expense tracking application.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg">Start Tracking Free</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/40 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Everything You Need to Manage Your Money</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Multiple Accounts</h3>
                <p className="text-sm text-muted-foreground">
                  Track checking, savings, credit cards, and more in one place
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Smart Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize your spending with charts and detailed reports
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <PieChart className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Category Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Organize transactions with customizable income and expense categories
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your financial data is protected with bank-level security
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Join thousands of users who are taking control of their finances with ExpenseMate
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Create Your Free Account</Button>
          </Link>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ExpenseMate. Built with v0.</p>
        </div>
      </footer>
    </div>
  )
}
