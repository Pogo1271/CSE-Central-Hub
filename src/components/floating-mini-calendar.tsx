'use client'

import { useState } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface FloatingMiniCalendarProps {
  isOpen: boolean
  onClose: () => void
  onSelectRange: (start: Date | null, end: Date | null) => void
  initialStart?: Date | null
  initialEnd?: Date | null
}

export function FloatingMiniCalendar({ 
  isOpen, 
  onClose, 
  onSelectRange, 
  initialStart = null, 
  initialEnd = null 
}: FloatingMiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedStart, setSelectedStart] = useState<Date | null>(initialStart)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(initialEnd)
  const [isSelectingEnd, setIsSelectingEnd] = useState(false)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const handleDateClick = (date: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start new selection
      setSelectedStart(date)
      setSelectedEnd(null)
      setIsSelectingEnd(true)
    } else if (isSelectingEnd) {
      // Select end date
      if (date < selectedStart) {
        // If clicked date is before start, make it the new start
        setSelectedStart(date)
        setSelectedEnd(selectedStart)
      } else {
        setSelectedEnd(date)
      }
      setIsSelectingEnd(false)
    }
  }

  const handleDateHover = (date: Date) => {
    if (selectedStart && isSelectingEnd && !selectedEnd) {
      setHoverDate(date)
    }
  }

  const isDateInRange = (date: Date) => {
    if (!selectedStart) return false
    
    const end = selectedEnd || hoverDate
    if (!end) return false
    
    const rangeStart = selectedStart < end ? selectedStart : end
    const rangeEnd = selectedStart < end ? end : selectedStart
    
    return isWithinInterval(date, { start: rangeStart, end: rangeEnd })
  }

  const isDateSelected = (date: Date) => {
    return (selectedStart && isSameDay(date, selectedStart)) || 
           (selectedEnd && isSameDay(date, selectedEnd))
  }

  const getDateStatus = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return 'outside'
    
    if (selectedStart && isSameDay(date, selectedStart)) return 'start'
    if (selectedEnd && isSameDay(date, selectedEnd)) return 'end'
    if (isDateInRange(date)) return 'in-range'
    
    return 'normal'
  }

  const applyRange = () => {
    onSelectRange(selectedStart, selectedEnd)
    onClose()
  }

  const clearRange = () => {
    setSelectedStart(null)
    setSelectedEnd(null)
    setHoverDate(null)
    setIsSelectingEnd(false)
  }

  const getDateString = () => {
    if (selectedStart && selectedEnd) {
      return `${format(selectedStart, 'MMM dd, yyyy')} - ${format(selectedEnd, 'MMM dd, yyyy')}`
    } else if (selectedStart) {
      return `${format(selectedStart, 'MMM dd, yyyy')} - Select end date`
    }
    return 'Select date range'
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Select Date Range
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Selection Display */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm text-gray-600">Selected Range:</Label>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {getDateString()}
            </div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h4 className="font-medium text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {daysInMonth.map((date, index) => {
              const status = getDateStatus(date)
              const isSelected = isDateSelected(date)
              
              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => handleDateHover(date)}
                  className={`
                    relative h-8 w-8 rounded-full text-xs font-medium transition-all duration-200
                    ${status === 'outside' ? 'text-gray-300' : 'text-gray-700'}
                    ${isSelected ? 'bg-blue-600 text-white' : ''}
                    ${status === 'in-range' && !isSelected ? 'bg-blue-100 text-blue-700' : ''}
                    ${status === 'start' && !isSelected ? 'bg-blue-500 text-white' : ''}
                    ${status === 'end' && !isSelected ? 'bg-blue-500 text-white' : ''}
                    ${status === 'normal' ? 'hover:bg-gray-100' : ''}
                    ${isSelectingEnd && selectedStart && !selectedEnd ? 'cursor-pointer' : ''}
                  `}
                  disabled={status === 'outside'}
                >
                  {format(date, 'd')}
                  
                  {/* Range indicator dot for start/end dates */}
                  {status === 'start' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-800 rounded-full"></div>
                  )}
                  {status === 'end' && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-800 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center">
            {selectedStart && !selectedEnd ? (
              <span>Click to select end date</span>
            ) : (
              <span>Click to select start date, then click end date</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={applyRange}
              disabled={!selectedStart}
              className="flex-1"
            >
              Apply Range
            </Button>
            <Button 
              variant="outline" 
              onClick={clearRange}
              disabled={!selectedStart && !selectedEnd}
            >
              Clear
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}