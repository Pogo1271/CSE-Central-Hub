import { addDays, addWeeks, addMonths, addYears, startOfDay, endOfDay, isSameDay, isAfter, isBefore, parseISO, format } from 'date-fns'

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  interval: number
  count?: number
  endDate?: Date
  customDays?: number[] // For custom frequency: [0,1,2,3,4,5,6] where 0 = Sunday
  customWeeks?: number[] // For custom monthly: [1,2,3,4,5] for week numbers
  customMonths?: number[] // For custom yearly: [0,1,2,3,4,5,6,7,8,9,10,11] for months
}

export interface RecurrenceOptions {
  startDate: Date
  endDate?: Date
  rule: RecurrenceRule
  excludeDates?: Date[]
  includeDates?: Date[]
}

export interface GeneratedInstance {
  startDate: Date
  endDate: Date
  isException: boolean
  exceptionType?: 'modified' | 'cancelled' | 'moved'
  originalStartDate?: Date
}

/**
 * Generate recurring task instances based on recurrence rules
 */
export function generateRecurringInstances(options: RecurrenceOptions): GeneratedInstance[] {
  const { startDate, endDate, rule, excludeDates = [], includeDates = [] } = options
  const instances: GeneratedInstance[] = []
  
  if (!startDate) return instances
  
  let currentDate = startOfDay(new Date(startDate))
  const endLimit = endDate ? endOfDay(endDate) : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000) // Default to 1 year
  
  let count = 0
  const maxInstances = rule.count || 1000 // Safety limit
  
  while (count < maxInstances && currentDate <= endLimit) {
    // Skip dates that are in exclude list
    if (excludeDates.some(excludeDate => isSameDay(currentDate, excludeDate))) {
      currentDate = getNextOccurrence(currentDate, rule)
      continue
    }
    
    // Add instance
    instances.push({
      startDate: currentDate,
      endDate: calculateEndDate(currentDate, rule),
      isException: false
    })
    
    count++
    
    // Break if we've reached the specified count
    if (rule.count && count >= rule.count) {
      break
    }
    
    // Move to next occurrence
    currentDate = getNextOccurrence(currentDate, rule)
  }
  
  // Add any explicitly included dates
  includeDates.forEach(includeDate => {
    if (!instances.some(instance => isSameDay(instance.startDate, includeDate))) {
      instances.push({
        startDate: includeDate,
        endDate: calculateEndDate(includeDate, rule),
        isException: false
      })
    }
  })
  
  return instances.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
}

/**
 * Calculate the next occurrence based on recurrence rule
 */
function getNextOccurrence(currentDate: Date, rule: RecurrenceRule): Date {
  const nextDate = new Date(currentDate)
  
  switch (rule.frequency) {
    case 'daily':
      return addDays(nextDate, rule.interval || 1)
      
    case 'weekly':
      if (rule.customDays && rule.customDays.length > 0) {
        // Custom days of the week
        const currentDay = nextDate.getDay()
        const nextDay = findNextCustomDay(currentDay, rule.customDays)
        const daysToAdd = nextDay <= currentDay ? 7 - (currentDay - nextDay) : nextDay - currentDay
        return addDays(nextDate, daysToAdd)
      }
      return addWeeks(nextDate, rule.interval || 1)
      
    case 'monthly':
      if (rule.customWeeks && rule.customWeeks.length > 0) {
        // Custom weeks of the month
        return addMonths(nextDate, rule.interval || 1)
      }
      return addMonths(nextDate, rule.interval || 1)
      
    case 'yearly':
      if (rule.customMonths && rule.customMonths.length > 0) {
        // Custom months of the year
        const currentMonth = nextDate.getMonth()
        const nextMonth = findNextCustomMonth(currentMonth, rule.customMonths)
        const monthsToAdd = nextMonth <= currentMonth ? 12 - (currentMonth - nextMonth) : nextMonth - currentMonth
        return addMonths(nextDate, monthsToAdd)
      }
      return addYears(nextDate, rule.interval || 1)
      
    case 'custom':
      // Custom interval in days
      return addDays(nextDate, rule.interval || 1)
      
    default:
      return addDays(nextDate, 1)
  }
}

/**
 * Calculate end date based on start date and rule
 */
function calculateEndDate(startDate: Date, rule: RecurrenceRule): Date {
  // For now, assume same day events
  // This could be enhanced to support duration-based events
  return endOfDay(startDate)
}

/**
 * Find the next custom day in the week
 */
function findNextCustomDay(currentDay: number, customDays: number[]): number {
  const sortedDays = [...customDays].sort((a, b) => a - b)
  
  for (const day of sortedDays) {
    if (day > currentDay) {
      return day
    }
  }
  
  // If no day is found later in the week, return the first day of next week
  return sortedDays[0]
}

/**
 * Find the next custom month in the year
 */
function findNextCustomMonth(currentMonth: number, customMonths: number[]): number {
  const sortedMonths = [...customMonths].sort((a, b) => a - b)
  
  for (const month of sortedMonths) {
    if (month > currentMonth) {
      return month
    }
  }
  
  // If no month is found later in the year, return the first month of next year
  return sortedMonths[0]
}

/**
 * Parse RRULE string to RecurrenceRule object
 */
export function parseRRULE(rrule: string): RecurrenceRule {
  const rule: RecurrenceRule = {
    frequency: 'daily',
    interval: 1
  }
  
  const parts = rrule.split(';')
  
  for (const part of parts) {
    const [key, value] = part.split('=')
    
    switch (key.toUpperCase()) {
      case 'FREQ':
        rule.frequency = value.toLowerCase() as RecurrenceRule['frequency']
        break
      case 'INTERVAL':
        rule.interval = parseInt(value) || 1
        break
      case 'COUNT':
        rule.count = parseInt(value)
        break
      case 'UNTIL':
        rule.endDate = parseISO(value)
        break
      case 'BYDAY':
        const days = value.split(',').map(day => {
          const dayMap: { [key: string]: number } = {
            'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6
          }
          return dayMap[day.substring(0, 2)] || 0
        })
        rule.customDays = days
        break
      case 'BYMONTH':
        rule.customMonths = value.split(',').map(m => parseInt(m) - 1) // Convert to 0-based
        break
    }
  }
  
  return rule
}

/**
 * Convert RecurrenceRule to RRULE string
 */
export function toRRULE(rule: RecurrenceRule): string {
  const parts: string[] = []
  
  parts.push(`FREQ=${rule.frequency.toUpperCase()}`)
  
  if (rule.interval && rule.interval > 1) {
    parts.push(`INTERVAL=${rule.interval}`)
  }
  
  if (rule.count) {
    parts.push(`COUNT=${rule.count}`)
  }
  
  if (rule.endDate) {
    parts.push(`UNTIL=${format(rule.endDate, 'yyyyMMdd\\THHmmss\\Z')}`)
  }
  
  if (rule.customDays && rule.customDays.length > 0) {
    const dayMap: { [key: number]: string } = {
      0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA'
    }
    const days = rule.customDays.map(day => dayMap[day]).join(',')
    parts.push(`BYDAY=${days}`)
  }
  
  if (rule.customMonths && rule.customMonths.length > 0) {
    const months = rule.customMonths.map(m => m + 1).join(',') // Convert to 1-based
    parts.push(`BYMONTH=${months}`)
  }
  
  return parts.join(';')
}

/**
 * Check if a date matches a recurrence rule
 */
export function isDateMatchingRule(date: Date, rule: RecurrenceRule, startDate: Date): boolean {
  const dateObj = new Date(date)
  const startObj = new Date(startDate)
  
  switch (rule.frequency) {
    case 'daily':
      return isDailyMatch(dateObj, startObj, rule.interval)
      
    case 'weekly':
      return isWeeklyMatch(dateObj, startObj, rule.interval, rule.customDays)
      
    case 'monthly':
      return isMonthlyMatch(dateObj, startObj, rule.interval)
      
    case 'yearly':
      return isYearlyMatch(dateObj, startObj, rule.interval, rule.customMonths)
      
    case 'custom':
      return isCustomMatch(dateObj, startObj, rule.interval)
      
    default:
      return false
  }
}

function isDailyMatch(date: Date, startDate: Date, interval: number): boolean {
  const diffTime = Math.abs(date.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays % interval === 0
}

function isWeeklyMatch(date: Date, startDate: Date, interval: number, customDays?: number[]): boolean {
  const diffTime = Math.abs(date.getTime() - startDate.getTime())
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
  
  if (diffWeeks % interval !== 0) return false
  
  if (customDays && customDays.length > 0) {
    return customDays.includes(date.getDay())
  }
  
  return true
}

function isMonthlyMatch(date: Date, startDate: Date, interval: number): boolean {
  const diffMonths = (date.getFullYear() - startDate.getFullYear()) * 12 + (date.getMonth() - startDate.getMonth())
  return diffMonths % interval === 0 && date.getDate() === startDate.getDate()
}

function isYearlyMatch(date: Date, startDate: Date, interval: number, customMonths?: number[]): boolean {
  const diffYears = date.getFullYear() - startDate.getFullYear()
  
  if (diffYears % interval !== 0) return false
  
  if (customMonths && customMonths.length > 0) {
    return customMonths.includes(date.getMonth()) && date.getDate() === startDate.getDate()
  }
  
  return date.getMonth() === startDate.getMonth() && date.getDate() === startDate.getDate()
}

function isCustomMatch(date: Date, startDate: Date, interval: number): boolean {
  const diffTime = Math.abs(date.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays % interval === 0
}

/**
 * Get human-readable recurrence description
 */
export function getRecurrenceDescription(rule: RecurrenceRule): string {
  const { frequency, interval, count, endDate, customDays, customMonths } = rule
  
  const frequencyText = frequency === 'daily' ? 'day' : 
                       frequency === 'weekly' ? 'week' :
                       frequency === 'monthly' ? 'month' :
                       frequency === 'yearly' ? 'year' : 'custom period'
  
  const intervalText = interval > 1 ? `every ${interval} ${frequencyText}s` : `every ${frequencyText}`
  
  let description = intervalText
  
  if (customDays && customDays.length > 0) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const days = customDays.map(day => dayNames[day]).join(', ')
    description += ` on ${days}`
  }
  
  if (customMonths && customMonths.length > 0) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December']
    const months = customMonths.map(month => monthNames[month]).join(', ')
    description += ` in ${months}`
  }
  
  if (count) {
    description += `, ${count} times`
  } else if (endDate) {
    description += ` until ${format(endDate, 'MMM dd, yyyy')}`
  } else {
    description += ', forever'
  }
  
  return description
}

/**
 * Calculate the next occurrence after a given date
 */
export function getNextOccurrenceAfter(date: Date, rule: RecurrenceRule, startDate: Date): Date | null {
  const instances = generateRecurringInstances({
    startDate,
    rule,
    endDate: new Date(date.getTime() + 365 * 24 * 60 * 60 * 1000) // Look ahead 1 year
  })
  
  const nextInstance = instances.find(instance => isAfter(instance.startDate, date))
  return nextInstance ? nextInstance.startDate : null
}

/**
 * Calculate the previous occurrence before a given date
 */
export function getPreviousOccurrenceBefore(date: Date, rule: RecurrenceRule, startDate: Date): Date | null {
  const instances = generateRecurringInstances({
    startDate,
    rule,
    endDate: date
  })
  
  const previousInstance = instances.filter(instance => isBefore(instance.startDate, date)).pop()
  return previousInstance ? previousInstance.startDate : null
}