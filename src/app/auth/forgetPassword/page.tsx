"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function ForgetPasswordPage() {
    const [email, setEmail] = useState("")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()


    const handleForgetPassword = async () => {
        await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'http://localhost:3000/auth/update-password' })
        toast({
          title: "Password Reset",
          description: "If an account with that email exists, a password reset link has been sent.",
        })
        router.push("/auth/login")
        
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold"> Forget Password</CardTitle>
                    <CardDescription>Enter your email to reset your password</CardDescription>
                </CardHeader>
                <form onSubmit={handleForgetPassword}>
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
                       
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            back to Login?{" "}
                            <Link href="/auth/login" className="font-medium text-primary hover:underline">
                                Login
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
