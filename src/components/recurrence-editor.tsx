'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Minus, Info } from 'lucide-react'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { toRRULE, getRecurrenceDescription, type RecurrenceRule } from '@/lib/recurrence-utils'

interface RecurrenceEditorProps {
  value?: string // RRULE string
  onChange: (rrule: string | null) => void
  disabled?: boolean
}

export function RecurrenceEditor({ value, onChange, disabled = false }: RecurrenceEditorProps) {
  const [rule, setRule] = useState<RecurrenceRule>(() => {
    if (value) {
      try {
        // Parse the RRULE string - for now we'll use a simplified version
        // In a real implementation, you'd parse the full RRULE format
        const parts = value.split(';')
        const frequency = parts.find(p => p.startsWith('FREQ='))?.split('=')[1]?.toLowerCase() || 'weekly'
        const interval = parseInt(parts.find(p => p.startsWith('INTERVAL='))?.split('=')[1] || '1') || 1
        const count = parts.find(p => p.startsWith('COUNT='))?.split('=')[1]
        const until = parts.find(p => p.startsWith('UNTIL='))?.split('=')[1]
        
        return {
          frequency: frequency as RecurrenceRule['frequency'],
          interval,
          count: count ? parseInt(count) : undefined,
          endDate: until ? new Date(until) : undefined,
          customDays: frequency === 'weekly' ? [1, 2, 3, 4, 5] : undefined // Default to weekdays
        }
      } catch (error) {
        console.error('Error parsing RRULE:', error)
        return { frequency: 'weekly', interval: 1 }
      }
    }
    return { frequency: 'weekly', interval: 1 }
  })

  const updateRule = (updates: Partial<RecurrenceRule>) => {
    const newRule = { ...rule, ...updates }
    setRule(newRule)
    
    // Generate RRULE and call onChange
    try {
      const rrule = toRRULE(newRule)
      onChange(rrule)
    } catch (error) {
      console.error('Error generating RRULE:', error)
      onChange(null)
    }
  }

  const toggleCustomDay = (day: number) => {
    const currentDays = rule.customDays || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort()
    
    updateRule({ customDays: newDays.length > 0 ? newDays : undefined })
  }

  const toggleCustomMonth = (month: number) => {
    const currentMonths = rule.customMonths || []
    const newMonths = currentMonths.includes(month)
      ? currentMonths.filter(m => m !== month)
      : [...currentMonths, month].sort()
    
    updateRule({ customMonths: newMonths.length > 0 ? newMonths : undefined })
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Recurrence</Label>
        {value && (
          <Badge variant="secondary" className="text-xs">
            {getRecurrenceDescription(rule)}
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {/* Frequency Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Repeats</Label>
          <Select
            value={rule.frequency}
            onValueChange={(value: RecurrenceRule['frequency']) => updateRule({ frequency: value })}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interval */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Repeat every</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              value={rule.interval || 1}
              onChange={(e) => updateRule({ interval: parseInt(e.target.value) || 1 })}
              className="w-20"
              disabled={disabled}
            />
            <span className="text-sm text-muted-foreground">
              {rule.frequency === 'daily' ? 'day(s)' :
               rule.frequency === 'weekly' ? 'week(s)' :
               rule.frequency === 'monthly' ? 'month(s)' :
               rule.frequency === 'yearly' ? 'year(s)' :
               'day(s)'}
            </span>
          </div>
        </div>

        {/* Custom Days for Weekly */}
        {rule.frequency === 'weekly' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Repeat on</Label>
            <div className="flex gap-2">
              {dayNames.map((day, index) => (
                <Button
                  key={day}
                  variant={rule.customDays?.includes(index) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCustomDay(index)}
                  disabled={disabled}
                  className="w-10 h-10 p-0"
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Months for Yearly */}
        {rule.frequency === 'yearly' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Repeat in</Label>
            <div className="grid grid-cols-6 gap-2">
              {monthNames.map((month, index) => (
                <Button
                  key={month}
                  variant={rule.customMonths?.includes(index) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleCustomMonth(index)}
                  disabled={disabled}
                  className="text-xs"
                >
                  {month}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* End Condition */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Ends</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="never"
                checked={!rule.count && !rule.endDate}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateRule({ count: undefined, endDate: undefined })
                  }
                }}
                disabled={disabled}
              />
              <Label htmlFor="never" className="text-sm">Never</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="after"
                checked={!!rule.count}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateRule({ count: 10, endDate: undefined })
                  } else {
                    updateRule({ count: undefined })
                  }
                }}
                disabled={disabled}
              />
              <Label htmlFor="after" className="text-sm">After</Label>
              {rule.count && (
                <Input
                  type="number"
                  min="1"
                  value={rule.count}
                  onChange={(e) => updateRule({ count: parseInt(e.target.value) || undefined })}
                  className="w-20"
                  disabled={disabled}
                />
              )}
              <Label className="text-sm text-muted-foreground">occurrences</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="on"
                checked={!!rule.endDate}
                onCheckedChange={(checked) => {
                  if (checked) {
                    const endDate = new Date()
                    endDate.setMonth(endDate.getMonth() + 3) // Default to 3 months from now
                    updateRule({ endDate, count: undefined })
                  } else {
                    updateRule({ endDate: undefined })
                  }
                }}
                disabled={disabled}
              />
              <Label htmlFor="on" className="text-sm">On</Label>
              {rule.endDate && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[140px] justify-start text-left font-normal"
                      disabled={disabled}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(rule.endDate, 'MMM dd, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={rule.endDate}
                      onSelect={(date) => {
                        if (date) {
                          updateRule({ endDate: date, count: undefined })
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        {value && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {getRecurrenceDescription(rule)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}