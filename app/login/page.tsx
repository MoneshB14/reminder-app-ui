"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Mail, Lock, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const { login } = useAuth()

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()

        if (email !== "monesh141001@gmail.com") {
            toast({
                title: "Access Denied",
                description: "Only authorized email addresses are permitted",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            setShowOtp(true)
            toast({
                title: "Verification Code Sent",
                description: "Please check your email for the verification code",
            })
        }, 1500)
    }

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()

        if (otp !== "11111") {
            toast({
                title: "Invalid Code",
                description: "Please enter the correct verification code",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)

            // Store login state using the auth hook
            login(email)

            toast({
                title: "Authentication Successful",
                description: "Welcome to RemindMe",
            })

            // Redirect to dashboard
            router.push("/dashboard")
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative">
                <div className="flex items-center justify-center w-full p-12">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Bell className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-4">RemindMe</h1>
                        <p className="text-xl text-slate-300">Professional reminder management</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-12">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">RemindMe</h1>
                    </div>

                    {/* Login Card */}
                    <Card className="border-0 shadow-xl">
                        <CardContent className="p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    {showOtp ? "Verify Code" : "Welcome Back"}
                                </h2>
                                <p className="text-slate-600">
                                    {showOtp ? "Enter verification code" : "Sign in to continue"}
                                </p>
                            </div>

                            {!showOtp ? (
                                <form onSubmit={handleSendOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="pl-10 h-12 border-slate-200 focus:border-blue-500 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Sending..." : "Continue"}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="otp" className="text-sm font-semibold text-slate-700">
                                            Verification Code
                                        </Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="Enter code"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={5}
                                            required
                                            className="h-12 border-slate-200 focus:border-blue-500 rounded-lg text-center text-lg font-mono"
                                        />
                                        {/* <p className="text-xs text-slate-500 text-center">
                      Demo code: <span className="font-mono font-semibold">11111</span>
                    </p> */}
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Verifying..." : "Verify & Sign In"}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="w-full text-slate-600"
                                            onClick={() => setShowOtp(false)}
                                        >
                                            ← Back
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
