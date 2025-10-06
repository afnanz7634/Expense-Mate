"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "react-toastify"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            toast.error(error.message)
            setLoading(false)
            return
        }

        toast.success("Logged in successfully")
        router.push("/dashboard")
        router.refresh()

        // setTimeout(() => {
        //     setError("Authentication not configured. Please add Supabase integration.")
        //     setLoading(false)
        // }, 1000)
    }


    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                     
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="w-full space-y-4">
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign in
                            </Button>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    Don&apos;t have an account?
                                    <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                                        Sign up
                                    </Link>
                                </div>
                                <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
