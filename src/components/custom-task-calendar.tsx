'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Search, Filter, User, Building2, Calendar as CalendarIcon, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { EnhancedTaskForm } from './enhanced-task-form'
import * as api from '@/lib/client-api'

interface Task {
  id: string
  title: string
  description?: string
  startDate?: string
  endDate?: string
  allDay: boolean
  recurring: boolean
  recurringPattern?: string
  status: string
  priority: string
  assigneeId?: string
  businessId?: string
  assignee?: {
    id: string
    name: string
    email: string
    color?: string
  }
  business?: {
    id: string
    name: string
  }
}

interface User {
  id: string
  name: string
  email: string
  color?: string
}

interface Business {
  id: string
  name: string
}

interface CustomTaskCalendarProps {
  tasks: Task[]
  users: User[]
  businesses: Business[]
  onTaskUpdate?: (task: Task) => void
  onTaskCreate?: (task: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  onRefresh?: () => void
  calendarView?: 'month' | 'week' | 'day' | 'list'
  customDateRange?: { start: Date | null; end: Date | null }
}

export function CustomTaskCalendar({ 
  tasks, 
  users, 
  businesses, 
  onTaskUpdate, 
  onTaskCreate, 
  onTaskDelete,
  onRefresh,
  calendarView = 'month',
  customDateRange
}: CustomTaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverDay, setDragOverDay] = useState<Date | null>(null)
  
  const { toast } = useToast()
  const calendarRef = useRef<HTMLDivElement>(null)

  // Global drag end handler to clean up visual states
  useEffect(() => {
    const handleDragEnd = () => {
      // Clean up any remaining enhanced visual states
      document.querySelectorAll('.opacity-75.scale-95.shadow-xl').forEach(el => {
        el.classList.remove('opacity-75', 'scale-95', 'shadow-xl', 'ring-2', 'ring-blue-500', 'bg-blue-50')
        el.style.zIndex = ''
      })
      document.querySelectorAll('[data-calendar-day]').forEach(el => {
        el.classList.remove('ring-4', 'ring-blue-400', 'bg-blue-50', 'scale-105', 'shadow-lg', 'outline', 'outline-4', 'outline-blue-400')
        el.removeAttribute('data-calendar-day')
      })
      setDragOverDay(null)
      setDraggedTask(null)
    }

    document.addEventListener('dragend', handleDragEnd)
    return () => {
      document.removeEventListener('dragend', handleDragEnd)
    }
  }, [])

  // Calendar navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  // Get days in month
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get days in week for week view
  const getDaysInWeek = (date: Date) => {
    const start = new Date(date)
    const day = start.getDay()
    start.setDate(start.getDate() - day)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    return eachDayOfInterval({ start, end })
  }

  // Get tasks for week view
  const getTasksForWeek = () => {
    const weekDays = getDaysInWeek(currentDate)
    return weekDays.map(day => ({
      date: day,
      tasks: tasks.filter(task => {
        if (!task.startDate) return false
        const taskDate = parseISO(task.startDate)
        
        // Apply custom date range filter if set
        if (customDateRange?.start && customDateRange?.end) {
          return taskDate >= customDateRange.start && taskDate <= customDateRange.end && isSameDay(taskDate, day)
        }
        
        return isSameDay(taskDate, day)
      })
    }))
  }

  // Get tasks for day view
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.startDate) return false
      const taskDate = parseISO(task.startDate)
      
      // Apply custom date range filter if set
      if (customDateRange?.start && customDateRange?.end) {
        return taskDate >= customDateRange.start && taskDate <= customDateRange.end && isSameDay(taskDate, date)
      }
      
      return isSameDay(taskDate, date)
    })
  }

  // Navigation functions for different views
  const navigatePeriod = (direction: 'prev' | 'next') => {
    switch (calendarView) {
      case 'month':
        setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
        break
      case 'week':
        setCurrentDate(direction === 'prev' ? new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000) : new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))
        break
      case 'day':
        setCurrentDate(direction === 'prev' ? new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) : new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))
        break
      case 'list':
        // List view doesn't have navigation
        break
      case 'custom':
        if (onNavigateCustomRange) {
          onNavigateCustomRange(direction)
        }
        break
    }
  }

  // Get tasks for a specific day (for month view)
  const getTasksForMonthDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.startDate) return false
      const taskDate = parseISO(task.startDate)
      
      // Apply custom date range filter if set
      if (customDateRange?.start && customDateRange?.end) {
        return taskDate >= customDateRange.start && taskDate <= customDateRange.end && isSameDay(taskDate, day)
      }
      
      return isSameDay(taskDate, day)
    })
  }

  // Get days in custom range
  const getDaysInCustomRange = () => {
    if (!customDateRange?.start || !customDateRange?.end) {
      return []
    }
    return eachDayOfInterval({ start: customDateRange.start, end: customDateRange.end })
  }

  // Get custom range organized by weeks
  const getCustomRangeWeeks = () => {
    const days = getDaysInCustomRange()
    if (days.length === 0) return []
    
    const weeks = []
    let currentWeek = []
    
    for (let i = 0; i < days.length; i++) {
      const day = days[i]
      const dayOfWeek = day.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      // If it's Monday and we already have days in currentWeek, start a new week
      if (dayOfWeek === 1 && currentWeek.length > 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }
      
      currentWeek.push(day)
      
      // If it's the last day, add the current week
      if (i === days.length - 1) {
        weeks.push(currentWeek)
      }
    }
    
    return weeks
  }

  // Handle drag start
  const handleDragStart = (task: Task, e: React.DragEvent) => {
    setDraggedTask(task)
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
    
    // Create a custom drag image with better styling
    const dragImage = document.createElement('div')
    dragImage.className = 'p-3 bg-white border-2 border-blue-400 rounded-lg shadow-xl text-sm font-medium max-w-xs'
    dragImage.style.position = 'absolute'
    dragImage.style.top = '-1000px'
    dragImage.style.zIndex = '9999'
    dragImage.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)'
    
    // Add task content to drag image
    dragImage.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${task.assignee?.color || '#6B7280'}"></div>
        <div class="truncate">
          <div class="font-semibold text-gray-900">${task.title}</div>
          ${task.assignee ? `<div class="text-xs text-gray-500">${task.assignee.name}</div>` : ''}
        </div>
      </div>
    `
    
    document.body.appendChild(dragImage)
    
    // Set drag image with offset for better positioning
    const rect = e.currentTarget.getBoundingClientRect()
    e.dataTransfer.setDragImage(dragImage, e.clientX - rect.left, e.clientY - rect.top)
    
    // Remove the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 100)
    
    // Add enhanced visual feedback to the dragged element
    const draggedElement = document.getElementById(`task-${task.id}`)
    if (draggedElement) {
      draggedElement.classList.add('opacity-75', 'scale-95', 'shadow-xl', 'ring-2', 'ring-blue-500', 'bg-blue-50')
      draggedElement.style.transition = 'all 0.2s ease-in-out'
      draggedElement.style.zIndex = '1000'
    }
  }

  // Handle drag over
  const handleDragOver = (day: Date, e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (!dragOverDay || !isSameDay(dragOverDay, day)) {
      // Remove previous highlight from all days
      document.querySelectorAll('[data-calendar-day]').forEach(el => {
        el.classList.remove('ring-4', 'ring-blue-400', 'bg-blue-50', 'scale-105', 'shadow-lg', 'outline', 'outline-4', 'outline-blue-400')
      })
      
      setDragOverDay(day)
      
      // Add Google Calendar style visual feedback to the drop zone with prominent outline
      const dropZone = e.currentTarget
      dropZone.classList.add('ring-4', 'ring-blue-400', 'bg-blue-50', 'scale-105', 'shadow-lg', 'outline', 'outline-4', 'outline-blue-400')
      dropZone.style.transition = 'all 0.2s ease-in-out'
      dropZone.setAttribute('data-calendar-day', day.toISOString())
    }
  }

  // Handle drag leave
  const handleDragLeave = (day: Date, e: React.DragEvent) => {
    if (dragOverDay && isSameDay(dragOverDay, day)) {
      setDragOverDay(null)
      
      // Remove Google Calendar style visual feedback from the drop zone
      const dropZone = e.currentTarget
      dropZone.classList.remove('ring-4', 'ring-blue-400', 'bg-blue-50', 'scale-105', 'shadow-lg', 'outline', 'outline-4', 'outline-blue-400')
      dropZone.removeAttribute('data-calendar-day')
    }
  }

  // Handle drop
  const handleDrop = (day: Date, e: React.DragEvent) => {
    e.preventDefault()
    setDragOverDay(null)
    
    // Remove Google Calendar style visual feedback from all drop zones
    document.querySelectorAll('[data-calendar-day]').forEach(el => {
      el.classList.remove('ring-4', 'ring-blue-400', 'bg-blue-50', 'scale-105', 'shadow-lg', 'outline', 'outline-4', 'outline-blue-400')
      el.removeAttribute('data-calendar-day')
    })
    
    // Remove enhanced visual feedback from dragged element
    if (draggedTask) {
      const draggedElement = document.getElementById(`task-${draggedTask.id}`)
      if (draggedElement) {
        draggedElement.classList.remove('opacity-75', 'scale-95', 'shadow-xl', 'ring-2', 'ring-blue-500', 'bg-blue-50')
        draggedElement.style.zIndex = ''
      }
    }
    
    if (!draggedTask) return

    const updatedTask = {
      ...draggedTask,
      startDate: day.toISOString()
    }

    if (onTaskUpdate) {
      onTaskUpdate(updatedTask)
    }

    toast({
      title: "Task Moved",
      description: `"${draggedTask.title}" moved to ${format(day, 'MMM dd, yyyy')}`,
    })

    setDraggedTask(null)
  }

  // Handle task update
  const handleUpdateTask = async () => {
    if (!selectedTask) return

    try {
      const response = await api.updateTask(selectedTask.id, selectedTask)
      if (response.success) {
        toast({
          title: "Task Updated",
          description: `"${selectedTask.title}" has been updated successfully.`,
        })
        setIsEditDialogOpen(false)
        setSelectedTask(null)
        if (onTaskUpdate) {
          onTaskUpdate(selectedTask)
        }
        // Trigger refresh to update colors and data
        if (onRefresh) {
          onRefresh()
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      })
    }
  }

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!selectedTask) return

    try {
      const response = await api.deleteTask(selectedTask.id)
      if (response.success) {
        toast({
          title: "Task Deleted",
          description: `"${selectedTask.title}" has been deleted.`,
        })
        setIsEditDialogOpen(false)
        setSelectedTask(null)
        if (onTaskDelete) {
          onTaskDelete(selectedTask.id)
        }
        // Trigger refresh to update colors and data
        if (onRefresh) {
          onRefresh()
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      })
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-red-100 text-red-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Convert hex to RGBA with opacity
  const hexToRgba = (hex: string, opacity: number) => {
    if (!hex) return `rgba(0, 0, 0, ${opacity})`
    
    // Remove # if present
    hex = hex.replace('#', '')
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Get task background color based on status and assignee
  const getTaskBackgroundColor = (task: Task) => {
    if (task.status === 'completed') {
      return '#FEE2E2' // Red background for completed tasks
    }
    
    if (task.assignee?.color) {
      return hexToRgba(task.assignee.color, 0.2) // 20% opacity of user color
    }
    
    return '#F3F4F6' // Default gray background
  }

  // Get task border color based on status and assignee
  const getTaskBorderColor = (task: Task) => {
    if (task.status === 'completed') {
      return '#FECACA' // Red border for completed tasks
    }
    
    if (task.assignee?.color) {
      return task.assignee.color // User color for border
    }
    
    return '#E5E7EB' // Default gray border
  }

  return (
    <div className="space-y-6">
      {/* Header with controls - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold">
            {calendarView === 'month' && format(currentDate, 'MMMM yyyy')}
            {calendarView === 'week' && `Week of ${format(currentDate, 'MMM dd, yyyy')}`}
            {calendarView === 'day' && format(currentDate, 'EEEE, MMMM dd, yyyy')}
            {calendarView === 'list' && 'Task List'}
            {calendarView === 'custom' && customDateRange?.start && customDateRange?.end && 
              `Custom Range: ${format(customDateRange.start, 'MMM dd')} - ${format(customDateRange.end, 'MMM dd, yyyy')}`}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigatePeriod('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              <CalendarIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigatePeriod('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="!w-[70vw] !max-w-none max-h-[90vh] overflow-y-auto">
              <EnhancedTaskForm
                users={users}
                businesses={businesses}
                onSubmit={async (taskData) => {
                  try {
                    const response = await api.createTask(taskData)
                    if (response.success) {
                      toast({
                        title: "Task Created",
                        description: `"${taskData.title}" has been created successfully.`,
                      })
                      setIsCreateDialogOpen(false)
                      if (onTaskCreate) {
                        onTaskCreate(taskData)
                      }
                      // Trigger refresh to update colors and data
                      if (onRefresh) {
                        onRefresh()
                      }
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to create task.",
                      variant: "destructive",
                    })
                  }
                }}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>



      {/* Calendar Grid - Responsive */}
      <div className={`${calendarView === 'month' ? 'grid grid-cols-7 gap-1' : 'block'}`}>
        {calendarView === 'month' && (
          <>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 sm:p-3 text-center font-semibold text-gray-600 border-b text-xs sm:text-sm">
                {day}
              </div>
            ))}
            
            {daysInMonth.map((day, index) => {
              const dayTasks = getTasksForMonthDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              
              return (
                <div
                  key={index}
                  className={`min-h-24 sm:min-h-32 p-1 sm:p-2 border border-gray-200 transition-all duration-200 ${
                    isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                  } ${dragOverDay && isSameDay(dragOverDay, day) ? 'bg-blue-50 border-blue-300 shadow-md' : ''}`}
                  onDragOver={(e) => handleDragOver(day, e)}
                  onDragLeave={(e) => handleDragLeave(day, e)}
                  onDrop={(e) => handleDrop(day, e)}
                >
                  <div className="flex justify-between items-center mb-1 sm:mb-2">
                    <span className={`text-xs sm:text-sm font-medium ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 max-h-16 sm:max-h-24 overflow-y-auto">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        id={`task-${task.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(task, e)}
                        onClick={() => {
                          setSelectedTask(task)
                          setIsEditDialogOpen(true)
                        }}
                        className="p-1.5 text-xs rounded cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
                        style={{
                          backgroundColor: getTaskBackgroundColor(task),
                          borderLeft: task.assignee?.color ? `4px solid ${task.assignee.color}` : 'none',
                          border: `1px solid ${getTaskBorderColor(task)}`,
                          minHeight: '24px'
                        }}
                        title={`${task.title}${task.description ? '\n' + task.description : ''}`}
                      >
                        <div className="font-medium truncate">{task.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}
        
        {calendarView === 'week' && (
          <div className="space-y-4">
            {/* Week Header - Mobile Responsive */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center font-semibold text-gray-600 border-b text-xs">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Week Grid - Mobile Responsive */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInWeek(currentDate).map((day, index) => {
                const dayTasks = getTasksForDay(day)
                const isToday = isSameDay(day, new Date())
                
                return (
                  <div
                    key={index}
                    className={`min-h-32 sm:min-h-40 p-1 sm:p-2 border border-gray-200 transition-all duration-200 ${
                      isToday ? 'bg-blue-50 border-blue-300 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'
                    } ${dragOverDay && isSameDay(dragOverDay, day) ? 'bg-blue-100 border-blue-400 shadow-md' : ''}`}
                    onDragOver={(e) => handleDragOver(day, e)}
                    onDragLeave={(e) => handleDragLeave(day, e)}
                    onDrop={(e) => handleDrop(day, e)}
                  >
                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                      <span className={`text-xs sm:text-sm font-medium ${
                        isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dayTasks.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 max-h-20 sm:max-h-28 overflow-y-auto">
                      {dayTasks.map((task) => (
                        <div
                          key={task.id}
                          id={`task-${task.id}`}
                          draggable
                          onDragStart={(e) => handleDragStart(task, e)}
                          onClick={() => {
                            setSelectedTask(task)
                            setIsEditDialogOpen(true)
                          }}
                          className="p-1.5 text-xs rounded cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
                          style={{
                            backgroundColor: getTaskBackgroundColor(task),
                            borderLeft: task.assignee?.color ? `3px solid ${task.assignee.color}` : 'none',
                            border: `1px solid ${getTaskBorderColor(task)}`,
                            minHeight: '24px'
                          }}
                          title={`${task.title}${task.description ? '\n' + task.description : ''}`}
                        >
                          <div className="font-medium truncate text-xs">{task.title}</div>
                          {task.assignee && (
                            <div className="flex items-center gap-1 mt-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: task.assignee.color || '#6B7280' }}
                              />
                              <span className="text-xs opacity-75 truncate">
                                {task.assignee.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {calendarView === 'day' && (
          <div className="space-y-4">
            {/* Day Header - Mobile Responsive */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">
                  {format(currentDate, 'EEEE, MMMM dd, yyyy')}
                </CardTitle>
              </CardHeader>
            </Card>
            
            {/* Day Tasks - Mobile Responsive */}
            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {getTasksForDay(currentDate).length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No tasks scheduled</p>
                      <p className="text-sm">Tasks for this day will appear here</p>
                    </div>
                  ) : (
                    getTasksForDay(currentDate)
                      .sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime())
                      .map((task) => (
                        <div
                          key={task.id}
                          id={`task-${task.id}`}
                          className="p-4 border-b hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
                          style={{
                            backgroundColor: getTaskBackgroundColor(task),
                            borderLeft: task.assignee?.color ? `4px solid ${task.assignee.color}` : 'none',
                            borderBottom: `1px solid ${getTaskBorderColor(task)}`
                          }}
                          title={`${task.title}${task.description ? '\n' + task.description : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-base sm:text-lg">{task.title}</h3>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getStatusColor(task.status)}`}
                                >
                                  {task.status}
                                </Badge>
                                {task.recurring && (
                                  <Badge variant="outline">
                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                    Recurring
                                  </Badge>
                                )}
                              </div>
                              
                              {task.description && (
                                <p className="text-gray-600 mb-3 text-sm">{task.description}</p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                {task.startDate && (
                                  <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" />
                                    {new Date(task.startDate).toLocaleDateString()}
                                  </div>
                                )}
                                
                                {task.assignee && (
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: task.assignee.color || '#6B7280' }}
                                    />
                                    {task.assignee.name}
                                  </div>
                                )}
                                
                                {task.business && (
                                  <div className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    {task.business.name}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setIsEditDialogOpen(true)
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onTaskDelete && onTaskDelete(task.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {calendarView === 'list' && (
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {tasks
                  .filter(task => {
                    if (!task.startDate) return false
                    if (customDateRange?.start && customDateRange?.end) {
                      const taskDate = parseISO(task.startDate)
                      return taskDate >= customDateRange.start && taskDate <= customDateRange.end
                    }
                    return true
                  })
                  .sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime())
                  .map((task) => (
                    <div
                      key={task.id}
                      id={`task-${task.id}`}
                      className="p-4 border-b hover:bg-gray-50 transition-colors"
                      style={{
                        backgroundColor: getTaskBackgroundColor(task),
                        borderLeft: task.assignee?.color ? `4px solid ${task.assignee.color}` : 'none',
                        borderBottom: `1px solid ${getTaskBorderColor(task)}`
                      }}
                      title={`${task.title}${task.description ? '\n' + task.description : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                            {task.recurring && (
                              <Badge variant="outline">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                Recurring
                              </Badge>
                            )}
                          </div>
                          
                          {task.description && (
                            <p className="text-gray-600 mb-3">{task.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {task.startDate && (
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {new Date(task.startDate).toLocaleDateString()}
                              </div>
                            )}
                            
                            {task.assignee && (
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: task.assignee.color || '#6B7280' }}
                                />
                                {task.assignee.name}
                              </div>
                            )}
                            
                            {task.business && (
                              <div className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {task.business.name}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onTaskDelete && onTaskDelete(task.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {calendarView === 'custom' && customDateRange?.start && customDateRange?.end && (
          <div className="space-y-4">
            {/* Custom Range Header */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">
                  Custom Range: {format(customDateRange.start, 'MMM dd, yyyy')} - {format(customDateRange.end, 'MMM dd, yyyy')}
                </CardTitle>
              </CardHeader>
            </Card>
            
            {/* Custom Range Grid - Organized by weeks */}
            <div className="space-y-4">
              {/* Week Headers */}
              <div className="grid grid-cols-7 gap-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="p-2 text-center font-semibold text-gray-600 border-b text-xs">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Week Rows */}
              {getCustomRangeWeeks().map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-cols-7 gap-1">
                  {week.map((day, dayIndex) => {
                    const dayTasks = getTasksForDay(day)
                    const isToday = isSameDay(day, new Date())
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`min-h-48 sm:min-h-56 p-1 sm:p-2 border border-gray-200 transition-all duration-200 calendar-drop-zone ${
                          isToday ? 'bg-blue-50 border-blue-300 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'
                        }`}
                        onDragOver={(e) => handleDragOver(day, e)}
                        onDragLeave={(e) => handleDragLeave(day, e)}
                        onDrop={(e) => handleDrop(day, e)}
                      >
                        <div className="flex justify-between items-center mb-1 sm:mb-2">
                          <div className="text-center">
                            <span className={`text-xs sm:text-sm font-medium ${
                              isToday ? 'text-blue-600 font-bold' : 'text-gray-900'
                            }`}>
                              {format(day, 'd')}
                            </span>
                            <div className="text-xs text-gray-500">
                              {format(day, 'EEE')}
                            </div>
                          </div>
                          {dayTasks.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {dayTasks.length}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 max-h-32 sm:max-h-40 overflow-y-auto">
                          {dayTasks.map((task) => (
                            <div
                              key={task.id}
                              id={`task-${task.id}`}
                              draggable
                              onDragStart={(e) => handleDragStart(task, e)}
                              onClick={() => {
                                setSelectedTask(task)
                                setIsEditDialogOpen(true)
                              }}
                              className="p-1.5 text-xs rounded cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 group"
                              style={{
                                backgroundColor: getTaskBackgroundColor(task),
                                borderLeft: task.assignee?.color ? `3px solid ${task.assignee.color}` : 'none',
                                border: `1px solid ${getTaskBorderColor(task)}`,
                                minHeight: '24px'
                              }}
                              title={`${task.title}${task.description ? '\n' + task.description : ''}`}
                            >
                              <div className="font-medium truncate text-xs">{task.title}</div>
                              {task.assignee && (
                                <div className="flex items-center gap-1 mt-1">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: task.assignee.color || '#6B7280' }}
                                  />
                                  <span className="text-xs opacity-75 truncate">
                                    {task.assignee.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedTask.description || ''}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-assignee">Assignee</Label>
                <Select 
                  value={selectedTask.assigneeId || ''} 
                  onValueChange={(value) => setSelectedTask({ ...selectedTask, assigneeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-business">Business</Label>
                <Select 
                  value={selectedTask.businessId || ''} 
                  onValueChange={(value) => setSelectedTask({ ...selectedTask, businessId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={selectedTask.status} 
                  onValueChange={(value) => setSelectedTask({ ...selectedTask, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between gap-2">
                <Button variant="destructive" onClick={handleDeleteTask}>
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateTask}>
                    Update
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}