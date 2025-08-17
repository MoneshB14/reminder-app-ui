"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export interface ReminderFormData {
  id?: string
  eventName: string
  date: string
  time: string
  recipientEmail: string
  notes?: string
  category: "work" | "personal" | "health" | "education" | "finance" | "social" | "other"
  priority: "low" | "medium" | "high"
  isRecurring?: boolean
  recurringType?: "daily" | "weekly" | "monthly" | "yearly"
  recurringEndDate?: string
}

interface ReminderFormProps {
  initialData?: ReminderFormData
  onSubmit: (data: ReminderFormData) => Promise<void> | void
  onCancel?: () => void
  isLoading?: boolean
  submitButtonText?: string
}

export default function ReminderForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitButtonText = "Create Reminder",
}: ReminderFormProps) {
  const [formData, setFormData] = useState<ReminderFormData>({
    eventName: initialData?.eventName || "",
    date: initialData?.date || "",
    time: initialData?.time || "",
    recipientEmail: initialData?.recipientEmail || "",
    category: initialData?.category || "work",
    priority: initialData?.priority || "medium",
    notes: initialData?.notes || "",
    isRecurring: initialData?.isRecurring || false,
    recurringType: initialData?.recurringType || "daily",
    recurringEndDate: initialData?.recurringEndDate || "",
  })

  const [errors, setErrors] = useState<{
    eventName?: string
    date?: string
    time?: string
    recipientEmail?: string
    notes?: string
    category?: string
    priority?: string
    recurringType?: string
    recurringEndDate?: string
  }>({})

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!formData.eventName.trim()) {
      newErrors.eventName = "Event name is required"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    } else {
      const selectedDate = new Date(formData.date)
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      if (selectedDate < now) {
        newErrors.date = "Please select a future date"
      }
    }

    if (!formData.time) {
      newErrors.time = "Time is required"
    }

    if (!formData.recipientEmail) {
      newErrors.recipientEmail = "Recipient email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recipientEmail)) {
      newErrors.recipientEmail = "Please enter a valid email address"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required"
    }

    if (formData.isRecurring && !formData.recurringEndDate) {
      newErrors.recurringEndDate = "End date is required for recurring reminders"
    }

    if (formData.isRecurring && !formData.recurringType) {
      newErrors.recurringType = "Recurring type is required for recurring reminders"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Clean up the form data - only include recurring fields if isRecurring is true
      const cleanFormData = { ...formData }
      
      if (!cleanFormData.isRecurring) {
        // Remove recurring-related fields when not recurring
        delete cleanFormData.recurringType
        delete cleanFormData.recurringEndDate
      }
      
      await onSubmit({ ...cleanFormData, id: initialData?.id })
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleInputChange = (field: keyof ReminderFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    
    // Clear recurring-related errors when isRecurring changes
    if (field === 'isRecurring') {
      setErrors((prev) => ({ 
        ...prev, 
        recurringType: undefined, 
        recurringEndDate: undefined 
      }))
    }
  }

  const isFormValid = formData.eventName && formData.date && formData.time && formData.recipientEmail && formData.category && formData.priority

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Reminder Details
          </CardTitle>
          <CardDescription>
            {initialData ? "Update your reminder information" : "Fill in the information below to create your reminder"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div className="space-y-2">
              <Label htmlFor="eventName">Event Name *</Label>
              <Input
                id="eventName"
                placeholder="Enter reminder title..."
                value={formData.eventName}
                onChange={(e) => handleInputChange("eventName", e.target.value)}
                className={errors.eventName ? "border-destructive" : ""}
              />
              {errors.eventName && <p className="text-sm text-destructive">{errors.eventName}</p>}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={errors.date ? "border-destructive" : ""}
                />
                {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className={errors.time ? "border-destructive" : ""}
                />
                {errors.time && <p className="text-sm text-destructive">{errors.time}</p>}
              </div>
            </div>

            {/* Recipient Email */}
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email *</Label>
              <Input
                id="recipientEmail"
                type="email"
                placeholder="Enter recipient email..."
                value={formData.recipientEmail}
                onChange={(e) => handleInputChange("recipientEmail", e.target.value)}
                className={errors.recipientEmail ? "border-destructive" : ""}
              />
              {errors.recipientEmail && <p className="text-sm text-destructive">{errors.recipientEmail}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                <SelectTrigger className={errors.priority ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-sm text-destructive">{errors.priority}</p>}
            </div>

            {/* Recurring Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => handleInputChange("isRecurring", checked)}
                />
                <Label htmlFor="isRecurring">Recurring Reminder</Label>
              </div>
              
              {formData.isRecurring && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurringType">Recurring Type</Label>
                    <Select value={formData.recurringType} onValueChange={(value) => handleInputChange("recurringType", value)}>
                      <SelectTrigger className={errors.recurringType ? "border-destructive" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.recurringType && <p className="text-sm text-destructive">{errors.recurringType}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurringEndDate">End Date</Label>
                    <Input
                      id="recurringEndDate"
                      type="date"
                      value={formData.recurringEndDate}
                      onChange={(e) => handleInputChange("recurringEndDate", e.target.value)}
                      className={errors.recurringEndDate ? "border-destructive" : ""}
                    />
                    {errors.recurringEndDate && <p className="text-sm text-destructive">{errors.recurringEndDate}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or details..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!isFormValid || isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {submitButtonText}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {formData.eventName && (
        <Card className="bg-muted/50 border-border">
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
            <CardDescription>How your reminder will appear</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">{formData.eventName}</h3>
              {formData.date && formData.time && (
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(`${formData.date}T${formData.time}`).toLocaleDateString()} at{" "}
                  {new Date(`${formData.date}T${formData.time}`).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
              <div className="flex gap-2">
                {formData.category && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                    {formData.category}
                  </span>
                )}
                {formData.priority && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      formData.priority === "high"
                        ? "bg-destructive/10 text-destructive"
                        : formData.priority === "medium"
                          ? "bg-accent/10 text-accent"
                          : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {formData.priority} priority
                  </span>
                )}
              </div>
              {formData.isRecurring && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  {formData.recurringType} recurring
                </span>
              )}
              {formData.notes && <p className="text-sm text-muted-foreground mt-2">{formData.notes}</p>}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
