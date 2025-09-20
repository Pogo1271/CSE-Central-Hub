'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { 
  Calendar, 
  List, 
  Filter, 
  Search, 
  Plus, 
  User, 
  Building2, 
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { CustomTaskCalendar } from './custom-task-calendar'
import { FloatingMiniCalendar } from './floating-mini-calendar'
import { EnhancedTaskForm } from './enhanced-task-form'
import * as api from '@/lib/client-api'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  createdAt: string
  updatedAt: string
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

export default function EnhancedTaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchCriteria, setSearchCriteria] = useState<string>('title')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [filteredSearchTasks, setFilteredSearchTasks] = useState<Task[]>([])
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [selectedBusiness, setSelectedBusiness] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('startDate')
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day' | 'list' | 'custom'>('month')
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [showFloatingCalendar, setShowFloatingCalendar] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  const { toast } = useToast()

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [tasksResponse, usersResponse, businessesResponse] = await Promise.all([
        api.getTasks(),
        api.getUsers(),
        api.getBusinesses()
      ])

      if (tasksResponse.success) setTasks(tasksResponse.data)
      if (usersResponse.success) setUsers(usersResponse.data)
      if (businessesResponse.success) setBusinesses(businessesResponse.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Filter search results for dropdown
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSearchTasks([])
      setShowSearchDropdown(false)
      return
    }
    
    const filtered = tasks.filter(task => {
      const searchLower = searchTerm.toLowerCase()
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.business?.name.toLowerCase().includes(searchLower) ||
        task.assignee?.name.toLowerCase().includes(searchLower)
      )
    }).slice(0, 10) // Limit to 10 results
    
    setFilteredSearchTasks(filtered)
    setShowSearchDropdown(true)
  }, [searchTerm, tasks])

  // Handle custom date range selection from floating calendar
  const handleCustomRangeSelect = (start: Date | null, end: Date | null) => {
    setCustomDateRange({ start, end })
    setShowCustomRange(!!start && !!end)
    
    if (start && end) {
      // Automatically switch to custom view when a range is selected
      setCalendarView('custom')
      setViewMode('calendar')
      toast({
        title: "Custom Range Applied",
        description: `Showing tasks from ${format(start, 'MMM dd, yyyy')} to ${format(end, 'MMM dd, yyyy')}`,
      })
    } else if (!start && !end) {
      // If range is cleared, switch back to month view
      setCalendarView('month')
    }
  }

  // Utility function to format dates consistently
  const formatDate = (date: Date | string) => {
    try {
      const d = new Date(date)
      // Use a consistent format that works on both server and client
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  useEffect(() => {
    loadData()
  }, [loadData])
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      (searchCriteria === 'title' && task.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (searchCriteria === 'description' && task.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (searchCriteria === 'business' && task.business?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (searchCriteria === 'assignee' && task.assignee?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesUser = selectedUser === 'all' || task.assigneeId === selectedUser
    const matchesBusiness = selectedBusiness === 'all' || task.businessId === selectedBusiness
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus

    return matchesSearch && matchesUser && matchesBusiness && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'startDate':
        return new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime()
      case 'status':
        return a.status.localeCompare(b.status)
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  // Filter tasks for list view with custom date range
  const listTasks = filteredTasks.filter(task => {
    if (!task.startDate) return false
    if (customDateRange?.start && customDateRange?.end) {
      const taskDate = new Date(task.startDate)
      return taskDate >= customDateRange.start && taskDate <= customDateRange.end
    }
    return true
  })

  // Handle custom range navigation
  const handleCustomRangeNavigation = (direction: 'prev' | 'next') => {
    if (customDateRange.start && customDateRange.end) {
      const rangeDuration = customDateRange.end.getTime() - customDateRange.start.getTime()
      const newStart = direction === 'prev' 
        ? new Date(customDateRange.start.getTime() - rangeDuration)
        : new Date(customDateRange.end.getTime() + rangeDuration)
      const newEnd = new Date(newStart.getTime() + rangeDuration)
      
      setCustomDateRange({ start: newStart, end: newEnd })
      toast({
        title: "Range Updated",
        description: `Showing tasks from ${format(newStart, 'MMM dd, yyyy')} to ${format(newEnd, 'MMM dd, yyyy')}`,
      })
    }
  }

  // Task handlers
  const handleTaskUpdate = async (updatedTask: any) => {
    try {
      const response = await api.updateTask(updatedTask.id, updatedTask)
      if (response.success) {
        setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task))
        toast({
          title: "Success",
          description: "Task updated successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const handleTaskCreate = async (taskData: Partial<Task>) => {
    try {
      const response = await api.createTask(taskData)
      if (response.success) {
        setTasks(prev => [...prev, ...response.data])
        toast({
          title: "Success",
          description: "Task created successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      const response = await api.deleteTask(taskId)
      if (response.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId))
        toast({
          title: "Success",
          description: "Task deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    pending: tasks.filter(t => t.status === 'pending').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl sm:text-3xl">Task Management</CardTitle>
              <CardDescription className="mt-2">Manage your team's tasks and deadlines</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => {
                  // Use existing Google auth for calendar integration
                  const authUrl = '/api/auth/google?redirect_uri=' + encodeURIComponent(`${window.location.origin}/api/auth/google/callback`)
                  window.location.href = authUrl
                }}
                className="w-full sm:w-auto"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Connect Google Calendar
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
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
                          setTasks(prev => [...prev, ...response.data])
                          toast({
                            title: "Task Created",
                            description: `"${taskData.title}" has been created successfully.`,
                          })
                          setIsCreateDialogOpen(false)
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
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{taskStats.total}</p>
              </div>
              <List className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-600">{taskStats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

      </div>



      {/* View Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Main View Toggle */}
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                onClick={() => setViewMode('calendar')}
                className="w-full sm:w-auto"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="w-full sm:w-auto"
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
            </div>
            
            {/* Calendar View Options */}
            {viewMode === 'calendar' && (
              <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-start lg:justify-end">
                <Button
                  variant={calendarView === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('month')}
                  className="text-xs"
                >
                  Month
                </Button>
                <Button
                  variant={calendarView === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('week')}
                  className="text-xs"
                >
                  Week
                </Button>
                <Button
                  variant={calendarView === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('day')}
                  className="text-xs"
                >
                  Day
                </Button>
                <Button
                  variant={calendarView === 'custom' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (customDateRange.start && customDateRange.end) {
                      setCalendarView('custom')
                    } else {
                      setShowFloatingCalendar(true)
                    }
                  }}
                  className="text-xs"
                >
                  Custom Range
                </Button>
              </div>
            )}
            
            {/* Task Count */}
            <div className="text-sm text-gray-600 text-center lg:text-right w-full lg:w-auto">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floating Mini Calendar */}
      <FloatingMiniCalendar
        isOpen={showFloatingCalendar}
        onClose={() => setShowFloatingCalendar(false)}
        onSelectRange={handleCustomRangeSelect}
        initialStart={customDateRange.start}
        initialEnd={customDateRange.end}
      />
      
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'calendar' | 'list')}>
        <TabsContent value="calendar" className="mt-0">
          <CustomTaskCalendar
            tasks={filteredTasks}
            users={users}
            businesses={businesses}
            onTaskUpdate={handleTaskUpdate}
            onTaskCreate={handleTaskCreate}
            onTaskDelete={handleTaskDelete}
            onRefresh={loadData}
            onNavigateCustomRange={handleCustomRangeNavigation}
            calendarView={calendarView}
            customDateRange={customDateRange}
          />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          {customDateRange.start && customDateRange.end && (
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Custom Range: {format(customDateRange.start, 'MMM dd, yyyy')} - {format(customDateRange.end, 'MMM dd, yyyy')}
                </CardTitle>
              </CardHeader>
            </Card>
          )}
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {listTasks.map((task) => (
                  <div
                    key={task.id}
                    id={`task-${task.id}`}
                    className="p-4 border-b hover:bg-gray-50 transition-colors"
                    style={{
                      backgroundColor: task.status === 'completed' 
                        ? '#FEE2E2' 
                        : task.assignee?.color 
                          ? `${task.assignee.color}10` 
                          : 'transparent',
                      borderLeft: task.assignee?.color ? `4px solid ${task.assignee.color}` : 'none',
                      borderBottom: task.status === 'completed' ? '1px solid #FECACA' : '1px solid #E5E7EB'
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
                            // Handle edit
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTaskDelete(task.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredTasks.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tasks found matching your filters.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}