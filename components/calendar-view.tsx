"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { reminderAPI, type CalendarEvent } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

interface CalendarViewProps {
  onEventClick?: (event: CalendarEvent) => void
}

export default function CalendarView({ onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    // Debug: Log the initial date
    console.log(`Initial currentDate: ${now.toISOString()}`)
    console.log(`Initial month: ${now.getMonth() + 1}, year: ${now.getFullYear()}`)
    return now
  })
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useEnhancedCalendar, setUseEnhancedCalendar] = useState(false)
  const { toast } = useToast()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Fetch events for the current month
  const fetchMonthEvents = async (year: number, month: number) => {
    setIsLoading(true)
    setError(null)

    try {
      if (useEnhancedCalendar) {
        // Use enhanced calendar endpoint
        const response = await reminderAPI.getEnhancedMonthCalendar(year, month)
        if (response.success && response.data && response.data.calendar) {
          // Extract events from enhanced calendar data
          const allEvents = response.data.calendar.flatMap(day => day.events || [])
          setEvents(allEvents)
          console.log(`Enhanced calendar: ${allEvents.length} events`)
          return
        }
      }

      // Fallback to basic calendar endpoint
      const startDate = new Date(Date.UTC(year, month, 1)).toISOString().split('T')[0]
      const endDate = new Date(Date.UTC(year, month + 1, 0)).toISOString().split('T')[0]

      const response = await reminderAPI.getCalendarEvents({
        startDate,
        endDate,
        view: "month"
      })

      if (response.success && response.data && Array.isArray(response.data.events)) {
        setEvents(response.data.events)
      } else {
        setEvents([])
        setError("Failed to load calendar events")
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      setEvents([])
      setError("Failed to load calendar events")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch events when month changes
  useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    fetchMonthEvents(year, month)
  }, [currentDate])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }

      // Debug: Log the month navigation
      console.log(`Navigating ${direction}: ${prev.toISOString().split('T')[0]} -> ${newDate.toISOString().split('T')[0]}`)
      console.log(`Month: ${newDate.getMonth() + 1}, Year: ${newDate.getFullYear()}`)

      return newDate
    })
  }

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Use UTC dates to avoid timezone issues
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1))
    const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0))
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(Date.UTC(year, month, day))
      // Debug: Log the date being created
      console.log(`Creating calendar day: ${day} -> ${date.toISOString().split('T')[0]}`)
      days.push(date)
    }

    return days
  }, [currentDate])

  const getEventsForDate = (date: Date | null) => {
    if (!date || !Array.isArray(events)) return []

    const dateString = date.toISOString().split('T')[0]

    // Debug: Log the date we're looking for
    console.log(`Looking for events on date: ${dateString}`)

    return events.filter((event) => {
      if (!event || !event.date) return false

      // Handle ISO date format (2025-08-17T00:00:00.000Z) and time separately
      let eventDate: string
      if (event.date.includes('T')) {
        // If date is already in ISO format, extract just the date part
        // Use the date as-is without timezone conversion to avoid shifting
        eventDate = event.date.split('T')[0]
      } else {
        // If date is simple format, use it directly
        eventDate = event.date
      }

      // Debug: Log the event date being checked
      console.log(`Event "${event.title}" has date: ${event.date} -> parsed as: ${eventDate}`)

      const matches = eventDate === dateString
      if (matches) {
        console.log(`✓ Event "${event.title}" matches date ${dateString}`)
      }

      return matches
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive"
      case "medium":
        return "bg-accent"
      case "low":
        return "bg-secondary"
      default:
        return "bg-muted"
    }
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    // Use ISO date strings for comparison to avoid timezone issues
    const dateString = date.toISOString().split('T')[0]
    const todayString = today.toISOString().split('T')[0]
    return dateString === todayString
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Calendar View
          </CardTitle>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseEnhancedCalendar(!useEnhancedCalendar)}
              className="text-xs"
            >
              {useEnhancedCalendar ? "Enhanced" : "Basic"} View
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-lg font-semibold min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground mb-2">{error}</p>
            {error.includes("sample data") ? (
              <p className="text-sm">Calendar API is not available, showing sample events</p>
            ) : (
              <p className="text-sm">Calendar events could not be loaded</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const year = currentDate.getFullYear()
                const month = currentDate.getMonth()
                fetchMonthEvents(year, month)
              }}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const dayEvents = getEventsForDate(date)
                const isCurrentDay = isToday(date)

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 border border-border rounded-md ${date ? "bg-background hover:bg-muted/50 cursor-pointer" : "bg-muted/20"
                      } ${isCurrentDay ? "ring-2 ring-primary" : ""}`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isCurrentDay ? "text-primary" : "text-foreground"}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              onClick={() => onEventClick?.(event)}
                              className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                            >
                              <div className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                                <span className={`truncate text-foreground ${event.isOverdue ? 'text-destructive font-medium' : ''}`}>
                                  {event.title}
                                </span>
                                {event.isOverdue && (
                                  <span className="text-destructive text-xs">⚠️</span>
                                )}
                                {event.isEventCompleted && (
                                  <span className="text-green-600 text-xs">✅</span>
                                )}
                              </div>
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {events.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No events found for this month</p>
                <p className="text-sm">Events will appear here when they are added to your calendar</p>
              </div>
            )}
          </>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-secondary" />
            <span>Low Priority</span>
          </div>
          {useEnhancedCalendar && (
            <>
              <div className="flex items-center gap-1">
                <span className="text-green-600">✅</span>
                <span>Event Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-destructive">⚠️</span>
                <span>Overdue</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
