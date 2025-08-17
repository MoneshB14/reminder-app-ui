"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, AlertCircle, CheckCircle2, Edit, Trash2, MoreHorizontal, AlarmClockIcon as Snooze, Repeat } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import ReminderForm, { type ReminderFormData } from "./reminder-form"
import type { Reminder, ReminderUpdateData } from "@/services/api"

interface ReminderCardProps {
  reminder: Reminder
  onEdit?: (reminder: Reminder) => void
  onDelete?: (id: string) => void
  onComplete?: (id: string) => void
  onSnooze?: (id: string, minutes: number) => void
}

export default function ReminderCard({ reminder, onEdit, onDelete, onComplete, onSnooze }: ReminderCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSnoozeDialogOpen, setIsSnoozeDialogOpen] = useState(false)
  const [snoozeMinutes, setSnoozeMinutes] = useState("15")

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-accent text-accent-foreground"
      case "low":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "bg-primary/10 text-primary"
      case "personal":
        return "bg-secondary/10 text-secondary"
      case "health":
        return "bg-accent/10 text-accent"
      case "finance":
        return "bg-chart-1/10 text-chart-1"
      case "education":
        return "bg-chart-2/10 text-chart-2"
      case "social":
        return "bg-chart-3/10 text-chart-3"
      case "other":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatTimeRemaining = (date: string, time: string) => {
    try {
      // Handle ISO date format (2025-09-09T00:00:00.000Z) and time separately
      let dueDate: Date
      if (date.includes('T')) {
        // If date is already in ISO format, use it directly
        dueDate = new Date(date)
      } else {
        // If date is simple format, combine with time
        dueDate = new Date(`${date}T${time}`)
      }
      
      // Check if the date is valid
      if (isNaN(dueDate.getTime())) {
        return "Invalid date"
      }
      
      const now = new Date()
      const diff = dueDate.getTime() - now.getTime()
      const days = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24))
      const hours = Math.floor((Math.abs(diff) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60))

      if (diff < 0) {
        if (days > 0) return `${days}d ${hours}h overdue`
        if (hours > 0) return `${hours}h ${minutes}m overdue`
        return `${minutes}m overdue`
      } else {
        if (days > 0) return `${days}d ${hours}h remaining`
        if (hours > 0) return `${hours}h ${minutes}m remaining`
        return `${minutes}m remaining`
      }
    } catch (error) {
      console.warn("Error formatting time remaining:", error)
      return "Invalid date"
    }
  }

  const handleEditSubmit = async (formData: ReminderFormData) => {
    const updatedReminder: Reminder = {
      ...reminder,
      eventName: formData.eventName,
      date: formData.date,
      time: formData.time,
      recipientEmail: formData.recipientEmail,
      category: formData.category,
      priority: formData.priority,
      notes: formData.notes,
      isRecurring: formData.isRecurring,
      recurringType: formData.recurringType,
      recurringEndDate: formData.recurringEndDate,
    }

    onEdit?.(updatedReminder)
    setIsEditDialogOpen(false)
  }

  const handleSnooze = () => {
    onSnooze?.(reminder._id, Number.parseInt(snoozeMinutes))
    setIsSnoozeDialogOpen(false)
  }

  const isOverdue = (() => {
    try {
      // Handle ISO date format (2025-09-09T00:00:00.000Z) and time separately
      let dueDate: Date
      if (reminder.date.includes('T')) {
        // If date is already in ISO format, use it directly
        dueDate = new Date(reminder.date)
      } else {
        // If date is simple format, combine with time
        dueDate = new Date(`${reminder.date}T${reminder.time}`)
      }
      return !isNaN(dueDate.getTime()) && dueDate < new Date()
    } catch (error) {
      console.warn("Error checking if reminder is overdue:", error)
      return false
    }
  })()
  
  const isCompleted = reminder.status === "completed"
  
  const dueDate = (() => {
    try {
      // Handle ISO date format (2025-09-09T00:00:00.000Z) and time separately
      let date: Date
      if (reminder.date.includes('T')) {
        // If date is already in ISO format, use it directly
        date = new Date(reminder.date)
      } else {
        // If date is simple format, combine with time
        date = new Date(`${reminder.date}T${reminder.time}`)
      }
      return isNaN(date.getTime()) ? null : date
    } catch (error) {
      console.warn("Error creating due date:", error)
      return null
    }
  })()

  return (
    <>
      <Card
        className={`bg-card ${isOverdue ? "border-destructive/50" : "border-border"} transition-all hover:shadow-md`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {isOverdue && <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />}
                {isCompleted && <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0" />}
                <span className={isCompleted ? "line-through text-muted-foreground" : ""}>{reminder.eventName}</span>
                {reminder.isRecurring && <Repeat className="h-4 w-4 text-blue-500" />}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getCategoryColor(reminder.category)}>{reminder.category}</Badge>
                <Badge className={getPriorityColor(reminder.priority)}>{reminder.priority}</Badge>
                <Badge variant="outline">{reminder.status}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 text-sm ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}
              >
                <Clock className="h-4 w-4" />
                <span className="whitespace-nowrap">{formatTimeRemaining(reminder.date, reminder.time)}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {!isCompleted && (
                    <>
                      <DropdownMenuItem onClick={() => setIsSnoozeDialogOpen(true)}>
                        <Snooze className="h-4 w-4 mr-2" />
                        Snooze
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onComplete?.(reminder._id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => onDelete?.(reminder._id)} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reminder.notes && <p className="text-sm text-muted-foreground mb-4">{reminder.notes}</p>}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {isCompleted ? "Completed" : isOverdue ? "Was due" : "Due"}: {dueDate ? dueDate.toLocaleDateString() : "Invalid date"} at{" "}
              {dueDate ? dueDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Invalid time"}
            </div>
            {!isCompleted && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsSnoozeDialogOpen(true)}>
                  <Snooze className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => onComplete?.(reminder._id)}>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reminder</DialogTitle>
            <DialogDescription>Update your reminder details below</DialogDescription>
          </DialogHeader>
          <ReminderForm
            initialData={{
              id: reminder._id,
              eventName: reminder.eventName,
              date: reminder.date,
              time: reminder.time,
              recipientEmail: reminder.recipientEmail,
              category: reminder.category,
              priority: reminder.priority,
              notes: reminder.notes,
              isRecurring: reminder.isRecurring,
              recurringType: reminder.recurringType,
              recurringEndDate: reminder.recurringEndDate,
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditDialogOpen(false)}
            submitButtonText="Update Reminder"
          />
        </DialogContent>
      </Dialog>

      {/* Snooze Dialog */}
      <Dialog open={isSnoozeDialogOpen} onOpenChange={setIsSnoozeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Snooze Reminder</DialogTitle>
            <DialogDescription>How long would you like to postpone this reminder?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={snoozeMinutes} onValueChange={setSnoozeMinutes}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="1440">1 day</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleSnooze} className="flex-1">
                Snooze
              </Button>
              <Button variant="outline" onClick={() => setIsSnoozeDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
