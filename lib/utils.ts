import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateToYYYYMMDD(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    console.warn('Error formatting date:', error)
    return 'Invalid date'
  }
}

export function formatDateTimeDisplay(dateString: string, timeString: string): string {
  try {
    let dateOnly: string
    
    if (dateString.includes('T')) {
      // If date is in ISO format (e.g., "2025-08-17T00:00:00.000Z"), extract just the date part
      dateOnly = dateString.split('T')[0]
    } else {
      // If date is already in simple format (e.g., "2025-08-17"), use it directly
      dateOnly = dateString
    }
    
    // Return the date in yyyy-mm-dd format with the original time
    return `${dateOnly} at ${timeString}`
  } catch (error) {
    console.warn('Error formatting date time display:', error)
    return 'Invalid date'
  }
}

export function calculateTimeRemaining(fullDateTime: string, fallbackDate: string, fallbackTime: string): string {
  try {
    let dueDate: Date
    
    if (fullDateTime) {
      // The fullDateTime field contains the correct due date and time
      // We need to parse it as local time, not UTC
      const dateTimeStr = fullDateTime.replace('Z', '') // Remove Z to treat as local time
      dueDate = new Date(dateTimeStr)
      console.log(`Using fullDateTime: ${fullDateTime} -> parsed as local time: ${dueDate.toISOString()}`)
    } else {
      // Fallback: combine date and time
      if (fallbackDate.includes('T')) {
        dueDate = new Date(fallbackDate)
        console.log(`Using fallback date: ${fallbackDate} -> ${dueDate.toISOString()}`)
      } else {
        dueDate = new Date(`${fallbackDate}T${fallbackTime}`)
        console.log(`Combined fallback: ${fallbackDate}T${fallbackTime} -> ${dueDate.toISOString()}`)
      }
    }
    
    if (isNaN(dueDate.getTime())) {
      return "Invalid date"
    }
    
    const now = new Date()
    console.log(`Current time: ${now.toISOString()}`)
    console.log(`Due time: ${dueDate.toISOString()}`)
    
    const diff = dueDate.getTime() - now.getTime()
    console.log(`Time difference: ${diff}ms (${diff / (1000 * 60 * 60)} hours)`)
    
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
    console.warn('Error calculating time remaining:', error)
    return 'Invalid date'
  }
}
