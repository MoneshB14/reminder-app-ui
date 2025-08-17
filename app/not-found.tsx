"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bell, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Bell className="h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">RemindMe</h1>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-6xl font-bold text-muted-foreground">404</h2>
          <h3 className="text-2xl font-semibold text-foreground">Page Not Found</h3>
          <p className="text-muted-foreground max-w-md">
            The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
