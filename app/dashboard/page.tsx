"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Plus, Search, CheckCircle2, CalendarIcon } from "lucide-react"
import Link from "next/link"
import ReminderCard from "@/components/reminder-card"
import CalendarView from "@/components/calendar-view"
import { useNotifications } from "@/hooks/use-notifications"
import { reminderAPI, type Reminder, type CalendarEvent } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    active: 0,
    completedToday: 0,
    overdue: 0,
    thisWeek: 0,
  })
  const { toast } = useToast()

  const { requestPermission, permission, isSupported } = useNotifications({
    reminders,
    enabled: notificationsEnabled,
  })

  // Fetch reminders and statistics on component mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Handle mounting state to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch upcoming reminders for the dashboard
      const upcomingResponse = await reminderAPI.getUpcomingReminders(20)
      if (upcomingResponse.success) {
        setReminders(upcomingResponse.data)
      }

      // Fetch overdue reminders
      const overdueResponse = await reminderAPI.getOverdueReminders()

      // Fetch completed reminders for today
      const today = new Date().toISOString().split('T')[0]
      const completedResponse = await reminderAPI.getCompletedReminders(1, 100) // Get more to filter by date

      // Fetch statistics
      const statsResponse = await reminderAPI.getStatistics()

      if (statsResponse.success) {
        const statsData = statsResponse.data

        // Calculate completed today count
        let completedToday = 0
        if (completedResponse.success) {
          completedToday = completedResponse.data.filter(reminder => {
            if (reminder.completedAt) {
              const completedDate = new Date(reminder.completedAt).toISOString().split('T')[0]
              return completedDate === today
            }
            return false
          }).length
        }

        // Calculate this week count (next 7 days)
        const thisWeek = upcomingResponse.success ? upcomingResponse.data.filter(reminder => {
          try {
            const reminderDate = new Date(reminder.date)
            const now = new Date()
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            return reminderDate <= weekFromNow && reminder.status === 'pending'
          } catch (error) {
            return false
          }
        }).length : 0

        setStats({
          active: statsData.pending,
          completedToday: completedToday,
          overdue: overdueResponse.success ? overdueResponse.data.length : statsData.overdue,
          thisWeek: thisWeek,
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!mounted) return
    const saved = localStorage.getItem("notifications-enabled")
    if (saved !== null) {
      setNotificationsEnabled(JSON.parse(saved))
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("notifications-enabled", JSON.stringify(notificationsEnabled))
  }, [notificationsEnabled, mounted])

  const handleEditReminder = async (updatedReminder: Reminder) => {
    try {
      const response = await reminderAPI.updateReminder(updatedReminder._id, {
        eventName: updatedReminder.eventName,
        notes: updatedReminder.notes,
        priority: updatedReminder.priority,
        category: updatedReminder.category,
      })

      if (response.success) {
        setReminders((prev) => prev.map((reminder) => (reminder._id === updatedReminder._id ? response.data : reminder)))
        toast({
          title: "Success!",
          description: "Reminder updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating reminder:", error)
      toast({
        title: "Error",
        description: "Failed to update reminder",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReminder = async (id: string) => {
    try {
      const response = await reminderAPI.deleteReminder(id)
      if (response.success) {
        setReminders((prev) => prev.filter((reminder) => reminder._id !== id))
        toast({
          title: "Success!",
          description: "Reminder deleted successfully",
        })
        // Refresh dashboard data to update statistics
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error deleting reminder:", error)
      toast({
        title: "Error",
        description: "Failed to delete reminder",
        variant: "destructive",
      })
    }
  }

  const handleCompleteReminder = async (id: string) => {
    try {
      const response = await reminderAPI.completeReminder(id)
      if (response.success) {
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder._id === id ? response.data : reminder,
          ),
        )
        toast({
          title: "Success!",
          description: "Reminder marked as completed",
        })
        // Refresh dashboard data to update statistics
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error completing reminder:", error)
      toast({
        title: "Error",
        description: "Failed to complete reminder",
        variant: "destructive",
      })
    }
  }

  const handleSnoozeReminder = async (id: string, minutes: number) => {
    try {
      const response = await reminderAPI.snoozeReminder(id, minutes)
      if (response.success) {
        setReminders((prev) =>
          prev.map((reminder) =>
            reminder._id === id ? response.data : reminder,
          ),
        )
        toast({
          title: "Success!",
          description: `Reminder snoozed for ${minutes} minutes`,
        })
        // Refresh dashboard data to update statistics
        fetchDashboardData()
      }
    } catch (error) {
      console.error("Error snoozing reminder:", error)
      toast({
        title: "Error",
        description: "Failed to snooze reminder",
        variant: "destructive",
      })
    }
  }

  const filteredReminders = useMemo(() => {
    return reminders.filter((reminder) => {
      const matchesSearch =
        reminder.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (reminder.notes && reminder.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = categoryFilter === "all" || reminder.category === categoryFilter
      const matchesPriority = priorityFilter === "all" || reminder.priority === priorityFilter

      return matchesSearch && matchesCategory && matchesPriority
    })
  }, [reminders, searchQuery, categoryFilter, priorityFilter])

  const upcomingReminders = filteredReminders.filter((r) => r.status === "pending")
  const overdueReminders = filteredReminders.filter((r) => {
    try {
      // Handle ISO date format (2025-09-09T00:00:00.000Z) and time separately
      let dueDate: Date
      if (r.date.includes('T')) {
        // If date is already in ISO format, use it directly
        dueDate = new Date(r.date)
      } else {
        // If date is simple format, combine with time
        dueDate = new Date(`${r.date}T${r.time}`)
      }

      // Check if the date is valid
      if (isNaN(dueDate.getTime())) {
        console.warn(`Invalid date for reminder ${r._id}: ${r.date}T${r.time}`)
        return false
      }
      const now = new Date()
      return dueDate < now && r.status !== "completed"
    } catch (error) {
      console.warn(`Error processing date for reminder ${r._id}:`, error)
      return false
    }
  })
  const completedReminders = filteredReminders.filter((r) => r.status === "completed")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
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
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={async (checked) => {
                  if (checked && permission !== "granted") {
                    const granted = await requestPermission()
                    if (granted) {
                      setNotificationsEnabled(true)
                    }
                  } else {
                    setNotificationsEnabled(checked)
                  }
                }}
              />
              {/* <Label htmlFor="notifications" className="text-sm">
                Browser Notifications
              </Label> */}
              <Link href="/add-reminder">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reminder
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Manage your reminders and stay organized</p>
        </div>

        {/* Quick Overview - Hidden */}
        {/* <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Overview</h3>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="text-xs"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                ) : (
                  "↻"
                )}
                <span className="ml-1">Refresh</span>
              </Button>
              {isSupported && (
                <div className="flex items-center gap-2">
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={async (checked) => {
                      if (checked && permission !== "granted") {
                        const granted = await requestPermission()
                        if (granted) {
                          setNotificationsEnabled(true)
                        }
                      } else {
                        setNotificationsEnabled(checked)
                      }
                    }}
                  />
                  <Label htmlFor="notifications" className="text-sm">
                    Browser Notifications
                  </Label>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {isLoading ? "..." : stats.active}
              </div>
              <div className="text-sm text-muted-foreground">Active Reminders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {isLoading ? "..." : stats.completedToday}
              </div>
              <div className="text-sm text-muted-foreground">Completed Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {isLoading ? "..." : stats.overdue}
              </div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {isLoading ? "..." : stats.thisWeek}
              </div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>
        </div> */}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reminders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingReminders.length})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              Overdue ({overdueReminders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedReminders.length})
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingReminders.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No upcoming reminders found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchQuery || categoryFilter !== "all" || priorityFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Create your first reminder to get started"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              upcomingReminders
                .sort((a, b) => {
                  try {
                    // Handle ISO date format (2025-09-09T00:00:00.000Z) and time separately
                    let dateA: Date, dateB: Date

                    if (a.date.includes('T')) {
                      dateA = new Date(a.date)
                    } else {
                      dateA = new Date(`${a.date}T${a.time}`)
                    }

                    if (b.date.includes('T')) {
                      dateB = new Date(b.date)
                    } else {
                      dateB = new Date(`${b.date}T${b.time}`)
                    }

                    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0
                    return dateA.getTime() - dateB.getTime()
                  } catch (error) {
                    console.warn("Error sorting upcoming reminders:", error)
                    return 0
                  }
                })
                .map((reminder) => (
                  <ReminderCard
                    key={reminder._id}
                    reminder={reminder}
                    onEdit={handleEditReminder}
                    onDelete={handleDeleteReminder}
                    onComplete={handleCompleteReminder}
                    onSnooze={handleSnoozeReminder}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-4">
            {overdueReminders.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No overdue reminders</p>
                    <p className="text-sm text-muted-foreground mt-2">Great job staying on top of your tasks!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              overdueReminders
                .sort((a, b) => {
                  try {
                    // Handle ISO date format (2025-09-09T00:00:00.000Z) and time separately
                    let dateA: Date, dateB: Date

                    if (a.date.includes('T')) {
                      dateA = new Date(a.date)
                    } else {
                      dateA = new Date(`${a.date}T${a.time}`)
                    }

                    if (b.date.includes('T')) {
                      dateB = new Date(b.date)
                    } else {
                      dateB = new Date(`${b.date}T${b.time}`)
                    }

                    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0
                    return dateB.getTime() - dateA.getTime() // Most overdue first
                  } catch (error) {
                    console.warn("Error sorting overdue reminders:", error)
                    return 0
                  }
                })
                .map((reminder) => (
                  <ReminderCard
                    key={reminder._id}
                    reminder={reminder}
                    onEdit={handleEditReminder}
                    onDelete={handleDeleteReminder}
                    onComplete={handleCompleteReminder}
                    onSnooze={handleSnoozeReminder}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedReminders.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No completed reminders yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Complete some tasks to see them here</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              completedReminders
                .sort((a, b) => {
                  try {
                    const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0)
                    const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0)
                    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0
                    return dateB.getTime() - dateA.getTime() // Most recently completed first
                  } catch (error) {
                    console.warn("Error sorting completed reminders:", error)
                    return 0
                  }
                })
                .map((reminder) => (
                  <ReminderCard
                    key={reminder._id}
                    reminder={reminder}
                    onEdit={handleEditReminder}
                    onDelete={handleDeleteReminder}
                    onComplete={handleCompleteReminder}
                    onSnooze={handleSnoozeReminder}
                  />
                ))
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <CalendarView onEventClick={setSelectedEvent} />
            {selectedEvent && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Selected Event</h4>
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h5 className="font-medium">{selectedEvent.title}</h5>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                        <span>at</span>
                        <span>{selectedEvent.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedEvent.category}</Badge>
                        <Badge variant="outline">{selectedEvent.priority}</Badge>
                        <Badge variant="outline">{selectedEvent.status}</Badge>
                        {selectedEvent.isOverdue && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                        {selectedEvent.isEventCompleted && (
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                            ✅ Event Completed
                          </Badge>
                        )}
                      </div>
                      {selectedEvent.notes && (
                        <p className="text-sm text-muted-foreground">{selectedEvent.notes}</p>
                      )}
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Recipient: {selectedEvent.recipientEmail}</p>
                        {selectedEvent.isRecurring && <p>🔄 Recurring Event</p>}
                        {selectedEvent.snoozeCount && selectedEvent.snoozeCount > 0 && (
                          <p>⏰ Snoozed {selectedEvent.snoozeCount} times</p>
                        )}
                        {selectedEvent.notificationSent && (
                          <p>📧 Notification sent</p>
                        )}
                        {selectedEvent.eventCompletedAt && (
                          <p>✅ Completed on: {new Date(selectedEvent.eventCompletedAt).toLocaleDateString()}</p>
                        )}
                        <p>Created: {new Date(selectedEvent.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
