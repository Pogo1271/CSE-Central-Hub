'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RecurrenceEditor } from '@/components/recurrence-editor'
import { RecurringEventEditModal } from '@/components/recurring-event-edit-modal'
import { EnhancedTooltip, EnhancedTooltipContent, EnhancedTooltipTrigger } from '@/components/ui/enhanced-tooltip'
import { Calendar, Users, Building2, Repeat, Clock, AlertCircle, Info } from 'lucide-react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'

interface Task {
  id?: string
  title: string
  description?: string
  startDate?: string
  endDate?: string
  allDay: boolean
  recurring: boolean
  recurrenceRule?: string
  status: string
  priority: string
  assigneeId?: string
  businessId?: string
  createdById?: string
  isRecurringMaster?: boolean
  hasInstances?: boolean
  affectedCount?: number
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

interface EnhancedTaskFormProps {
  task?: Task
  users: User[]
  businesses: Business[]
  onSubmit: (task: Partial<Task>) => void
  onCancel: () => void
  isEditing?: boolean
  isLoading?: boolean
}

export function EnhancedTaskForm({
  task,
  users,
  businesses,
  onSubmit,
  onCancel,
  isEditing = false,
  isLoading = false
}: EnhancedTaskFormProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
    allDay: false,
    recurring: false,
    recurrenceRule: '',
    status: 'pending',
    priority: 'medium',
    assigneeId: '',
    businessId: '',
    createdById: '',
    ...task
  })

  const [showRecurrenceEditor, setShowRecurrenceEditor] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editOption, setEditOption] = useState<'this' | 'this-and-future' | 'all'>('this')

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        startDate: task.startDate || new Date().toISOString(),
        endDate: task.endDate || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        allDay: task.allDay || false,
        recurring: task.recurring || false,
        recurrenceRule: task.recurrenceRule || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        assigneeId: task.assigneeId || '',
        businessId: task.businessId || '',
        createdById: task.createdById || '',
        isRecurringMaster: task.isRecurringMaster,
        hasInstances: task.hasInstances,
        affectedCount: task.affectedCount
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // If editing a recurring task, show the modal
    if (isEditing && task?.recurring && task?.hasInstances) {
      setShowEditModal(true)
      return
    }
    
    onSubmit(formData)
  }

  const handleModalConfirm = (option: 'this' | 'this-and-future' | 'all') => {
    setEditOption(option)
    setShowEditModal(false)
    
    // Add the edit option to the form data
    onSubmit({
      ...formData,
      editOption: option
    })
  }

  const updateFormData = (updates: Partial<Task>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the basic details for your task
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || 'pending'}
                  onValueChange={(value) => updateFormData({ status: value })}
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

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority || 'medium'}
                  onValueChange={(value) => updateFormData({ priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date and Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Date and Time
            </CardTitle>
            <CardDescription>
              Set when this task should occur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="allDay"
                checked={formData.allDay || false}
                onCheckedChange={(checked) => updateFormData({ allDay: checked })}
              />
              <Label htmlFor="allDay">All day event</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(new Date(formData.startDate), 'MMM dd, yyyy HH:mm') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.startDate ? new Date(formData.startDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(date)
                          if (!formData.allDay) {
                            // Preserve time if not all day
                            const oldDate = new Date(formData.startDate || new Date())
                            newDate.setHours(oldDate.getHours(), oldDate.getMinutes())
                          }
                          updateFormData({ startDate: newDate.toISOString() })
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {!formData.allDay && (
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.endDate ? format(new Date(formData.endDate), 'MMM dd, yyyy HH:mm') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.endDate ? new Date(formData.endDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(date)
                            // Preserve time
                            const oldDate = new Date(formData.endDate || new Date())
                            newDate.setHours(oldDate.getHours(), oldDate.getMinutes())
                            updateFormData({ endDate: newDate.toISOString() })
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assignment
            </CardTitle>
            <CardDescription>
              Assign this task to a person and/or business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select
                  value={formData.assigneeId || ''}
                  onValueChange={(value) => updateFormData({ assigneeId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          {user.color && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: user.color }}
                            />
                          )}
                          {user.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business">Business</Label>
                <Select
                  value={formData.businessId || ''}
                  onValueChange={(value) => updateFormData({ businessId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map((business) => (
                      <SelectItem key={business.id} value={business.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {business.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recurrence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Recurrence
            </CardTitle>
            <CardDescription>
              Set up a repeating schedule for this task
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.recurring || false}
                onCheckedChange={(checked) => {
                  updateFormData({ recurring: checked })
                  setShowRecurrenceEditor(checked)
                }}
              />
              <Label htmlFor="recurring">Recurring task</Label>
            </div>

            {formData.recurring && (
              <div className="mt-4">
                <RecurrenceEditor
                  value={formData.recurrenceRule}
                  onChange={(rule) => updateFormData({ recurrenceRule: rule || undefined })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        {formData.title && (
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm">Task Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{formData.title}</span>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(formData.status || 'pending')}>
                    {formData.status}
                  </Badge>
                  <Badge className={getPriorityColor(formData.priority || 'medium')}>
                    {formData.priority}
                  </Badge>
                </div>
              </div>
              
              {formData.description && (
                <p className="text-sm text-muted-foreground">{formData.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {formData.startDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(formData.startDate), 'MMM dd, yyyy HH:mm')}
                  </div>
                )}
                
                {formData.assigneeId && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {users.find(u => u.id === formData.assigneeId)?.name}
                  </div>
                )}
                
                {formData.businessId && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {businesses.find(b => b.id === formData.businessId)?.name}
                  </div>
                )}
              </div>
              
              {formData.recurring && formData.recurrenceRule && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Repeat className="h-4 w-4" />
                  Recurring task
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !formData.title}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>

      {/* Recurring Event Edit Modal */}
      <RecurringEventEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onConfirm={handleModalConfirm}
        eventTitle={formData.title || ''}
        eventStartDate={formData.startDate || ''}
        isRecurringMaster={formData.isRecurringMaster || false}
        hasInstances={formData.hasInstances || false}
        affectedCount={formData.affectedCount}
      />
    </>
  )
}