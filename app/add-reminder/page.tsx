"use client"

import { useState, useEffect } from "react"
import { Bell, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { reminderAPI } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

// Dynamically import ReminderForm to prevent SSR issues
const ReminderForm = dynamic(() => import("@/components/reminder-form"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8">Loading form...</div>
})

// Import the type separately
import type { ReminderFormData } from "@/components/reminder-form"

export default function AddReminderPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { isLoggedIn, isLoading: authLoading } = useAuth()

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login")
    }
  }, [isLoggedIn, authLoading, router])

  const handleSubmit = async (formData: ReminderFormData) => {
    setIsLoading(true)
    try {
      const response = await reminderAPI.createReminder(formData)
      
      if (response.success) {
        toast({
          title: "Success!",
          description: "Reminder created successfully",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: "Failed to create reminder",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving reminder:", error)
      toast({
        title: "Error",
        description: "Failed to create reminder. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Link href="/">
                <div className="flex items-center gap-2">
                  <Bell className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-bold text-foreground">RemindMe</h1>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Create New Reminder</h2>
          <p className="text-muted-foreground">Set up a new reminder to stay organized</p>
        </div>

        <ReminderForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
          submitButtonText="Create Reminder"
        />
      </main>
    </div>
  )
}
