import axios from "axios"

// Helper function to check if we're on the client side
const isClient = typeof window !== "undefined"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://reminder-app-node-api-production.up.railway.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (only on client side)
    if (isClient) {
      const token = localStorage.getItem("authToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && isClient) {
      // Handle unauthorized access (only on client side)
      localStorage.removeItem("authToken")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Types for API responses
export interface Reminder {
  _id: string
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
  status: "pending" | "sent" | "completed" | "snoozed" | "cancelled"
  createdAt: string
  updatedAt: string
  completedAt?: string
  snoozedUntil?: string
}

export interface ReminderFormData {
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

export interface ReminderUpdateData {
  eventName?: string
  notes?: string
  priority?: "low" | "medium" | "high"
  category?: "work" | "personal" | "health" | "education" | "finance" | "social" | "other"
}

// Calendar Event types
export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  fullDateTime: string
  category: "work" | "personal" | "health" | "education" | "finance" | "social" | "other"
  priority: "low" | "medium" | "high"
  status: "pending" | "sent" | "completed" | "snoozed" | "cancelled"
  notes?: string
  isRecurring?: boolean
  isOverdue?: boolean
  isEventCompleted?: boolean
  eventCompletedAt?: string
  recipientEmail: string
  snoozeCount?: number
  notificationSent?: boolean
  createdAt: string
  updatedAt: string
}

export interface CalendarEventsResponse {
  success: boolean
  data: {
    events: CalendarEvent[]
    eventsByDate: Record<string, CalendarEvent[]>
    totalEvents: number
    view: string
    dateRange: {
      start: string
      end: string
    }
  }
}

export interface CalendarMonthResponse {
  success: boolean
  data: {
    calendar: Array<{
      date: string
      dateString: string
      events: CalendarEvent[]
      eventCount: number
      isCurrentMonth: boolean
      isToday: boolean
      hasEvents: boolean
      hasHighPriority: boolean
      hasOverdue: boolean
      hasCompletedEvents: boolean
      hasPendingEvents: boolean
    }>
    month: number
    year: number
    totalEvents: number
  }
}

export interface CalendarWeekResponse {
  success: boolean
  data: {
    week: Array<{
      date: string
      dateString: string
      dayName: string
      dayShort: string
      events: CalendarEvent[]
      eventCount: number
      isToday: boolean
      hasCompletedEvents: boolean
      hasPendingEvents: boolean
    }>
    totalEvents: number
    dateRange: {
      start: string
      end: string
    }
  }
}

export interface CalendarSummaryResponse {
  success: boolean
  data: {
    today: number
    thisWeek: number
    thisMonth: number
    overdue: number
    summary: {
      date: string
      weekRange: {
        start: string
        end: string
      }
      monthRange: {
        start: string
        end: string
      }
    }
  }
}

export interface ReminderListResponse {
  success: boolean
  data: Reminder[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ReminderResponse {
  success: boolean
  data: Reminder
}

export interface StatisticsResponse {
  success: boolean
  data: {
    total: number
    pending: number
    completed: number
    overdue: number
    byCategory: Record<string, number>
    byPriority: Record<string, number>
  }
}

// API endpoints matching the backend specification
export const reminderAPI = {
  // System endpoints
  healthCheck: async () => {
    const response = await api.get("/health")
    return response.data
  },

  getApiDocs: async () => {
    const response = await api.get("/api/docs")
    return response.data
  },

  // Create reminders
  createReminder: async (reminder: ReminderFormData): Promise<ReminderResponse> => {
    const response = await api.post("/api/reminders", reminder)
    return response.data
  },

  // Get reminders with filtering and pagination
  getAllReminders: async (params?: {
    page?: number
    limit?: number
    sortBy?: "date" | "priority" | "category" | "eventName"
    sortOrder?: "asc" | "desc"
    status?: "pending" | "sent" | "completed" | "snoozed" | "cancelled"
    category?: string
    priority?: "low" | "medium" | "high"
  }): Promise<ReminderListResponse> => {
    const response = await api.get("/api/reminders", { params })
    return response.data
  },

  // Get reminders by status
  getRemindersByStatus: async (status: string): Promise<ReminderListResponse> => {
    const response = await api.get("/api/reminders", { params: { status } })
    return response.data
  },

  // Get reminders by category
  getRemindersByCategory: async (category: string): Promise<ReminderListResponse> => {
    const response = await api.get("/api/reminders", { params: { category } })
    return response.data
  },

  // Get reminders by priority
  getRemindersByPriority: async (priority: string): Promise<ReminderListResponse> => {
    const response = await api.get("/api/reminders", { params: { priority } })
    return response.data
  },

  // Get upcoming reminders
  getUpcomingReminders: async (limit?: number): Promise<ReminderListResponse> => {
    const response = await api.get("/api/reminders/upcoming", { params: { limit } })
    return response.data
  },

  // Get completed reminders
  getCompletedReminders: async (page?: number, limit?: number): Promise<ReminderListResponse> => {
    const response = await api.get("/api/reminders/completed", { params: { page, limit } })
    return response.data
  },

  // Get overdue reminders
  getOverdueReminders: async (): Promise<ReminderListResponse> => {
    const response = await api.get("/api/reminders/overdue")
    return response.data
  },

  // Get statistics
  getStatistics: async (): Promise<StatisticsResponse> => {
    const response = await api.get("/api/reminders/statistics")
    return response.data
  },

  // Individual reminder operations
  getReminderById: async (id: string): Promise<ReminderResponse> => {
    const response = await api.get(`/api/reminders/${id}`)
    return response.data
  },

  updateReminder: async (id: string, reminder: ReminderUpdateData): Promise<ReminderResponse> => {
    const response = await api.put(`/api/reminders/${id}`, reminder)
    return response.data
  },

  snoozeReminder: async (id: string, minutes: number): Promise<ReminderResponse> => {
    const response = await api.post(`/api/reminders/${id}/snooze`, { minutes })
    return response.data
  },

  completeReminder: async (id: string): Promise<ReminderResponse> => {
    const response = await api.post(`/api/reminders/${id}/complete`)
    return response.data
  },

  deleteReminder: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/reminders/${id}`)
    return response.data
  },

  // Calendar API endpoints
  getCalendarEvents: async (params?: {
    startDate?: string
    endDate?: string
    view?: "month" | "week" | "day"
    category?: string
    priority?: string
    status?: string
  }): Promise<CalendarEventsResponse> => {
    const response = await api.get("/api/calendar/events", { params })
    return response.data
  },

  getEventsByDate: async (date: string, params?: {
    category?: string
    priority?: string
  }): Promise<CalendarEventsResponse> => {
    const response = await api.get(`/api/calendar/events/date/${date}`, { params })
    return response.data
  },

  getCurrentMonthCalendar: async (): Promise<CalendarMonthResponse> => {
    const response = await api.get("/api/calendar/month/current")
    return response.data
  },

  getSpecificMonthCalendar: async (year: number, month: number): Promise<CalendarMonthResponse> => {
    const response = await api.get(`/api/calendar/month/${year}/${month}`)
    return response.data
  },

  getEnhancedMonthCalendar: async (year: number, month: number): Promise<CalendarMonthResponse> => {
    const response = await api.get(`/api/calendar/month/${year}/${month}`)
    return response.data
  },

  getCurrentWeekCalendar: async (): Promise<CalendarWeekResponse> => {
    const response = await api.get("/api/calendar/week")
    return response.data
  },

  getSpecificWeekCalendar: async (startDate: string): Promise<CalendarWeekResponse> => {
    const response = await api.get("/api/calendar/week", { params: { startDate } })
    return response.data
  },

  getCalendarSummary: async (): Promise<CalendarSummaryResponse> => {
    const response = await api.get("/api/calendar/summary")
    return response.data
  },
}

export default api
