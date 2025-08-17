"use client"

import { useEffect, useCallback, useState } from "react"
import type { Reminder } from "@/services/api"

interface UseNotificationsProps {
  reminders: Reminder[]
  enabled?: boolean
}

export function useNotifications({ reminders, enabled = true }: UseNotificationsProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const requestPermission = useCallback(async () => {
    if (!isClient || !("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission === "denied") {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }, [isClient])

  const showNotification = useCallback((reminder: Reminder) => {
    if (!isClient || !("Notification" in window) || Notification.permission !== "granted") {
      return
    }

    const notification = new Notification(`Reminder: ${reminder.eventName}`, {
      body: reminder.notes || "You have a reminder due now",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: `reminder-${reminder._id}`,
      requireInteraction: true,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
      // Navigate to dashboard
      window.location.href = "/dashboard"
    }

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)
  }, [isClient])

  const checkDueReminders = useCallback(() => {
    if (!enabled || !isClient) return

    const now = new Date()
    const upcomingReminders = reminders.filter((reminder) => {
      if (reminder.status !== "pending") return false

      const dueDate = new Date(`${reminder.date}T${reminder.time}`)
      const timeDiff = dueDate.getTime() - now.getTime()
      // Show notification if reminder is due within 5 minutes
      return timeDiff <= 5 * 60 * 1000 && timeDiff > 0
    })

    upcomingReminders.forEach((reminder) => {
      // Check if we've already shown notification for this reminder
      const notificationKey = `notification-shown-${reminder._id}`
      const lastShown = localStorage.getItem(notificationKey)

      // Only call Date.now() on the client side
      if (!lastShown || (isClient && Date.now() - Number.parseInt(lastShown) > 15 * 60 * 1000)) {
        showNotification(reminder)
        if (isClient) {
          localStorage.setItem(notificationKey, Date.now().toString())
        }
      }
    })
  }, [reminders, enabled, showNotification, isClient])

  useEffect(() => {
    if (!enabled || !isClient) return

    // Request permission on mount
    requestPermission()

    // Check for due reminders every minute
    const interval = setInterval(checkDueReminders, 60000)

    // Initial check
    checkDueReminders()

    return () => clearInterval(interval)
  }, [enabled, checkDueReminders, requestPermission, isClient])

  return {
    requestPermission,
    showNotification,
    isSupported: isClient && "Notification" in window,
    permission: isClient && typeof window !== "undefined" ? Notification.permission : "default",
  }
}
