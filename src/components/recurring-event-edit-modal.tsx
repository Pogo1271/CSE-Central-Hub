'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Building2, AlertTriangle } from 'lucide-react'

interface RecurringEventEditModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (option: 'this' | 'this-and-future' | 'all') => void
  eventTitle: string
  eventStartDate: string
  isRecurringMaster: boolean
  hasInstances: boolean
  affectedCount?: number
}

export function RecurringEventEditModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  eventStartDate,
  isRecurringMaster,
  hasInstances,
  affectedCount
}: RecurringEventEditModalProps) {
  const [selectedOption, setSelectedOption] = useState<'this' | 'this-and-future' | 'all'>('this')

  const handleConfirm = () => {
    onConfirm(selectedOption)
    onClose()
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }

  const getOptionDescription = (option: 'this' | 'this-and-future' | 'all') => {
    switch (option) {
      case 'this':
        return 'Only this occurrence will be modified. Other instances in the series will remain unchanged.'
      case 'this-and-future':
        return 'This occurrence and all future occurrences will be modified. Past instances will remain unchanged.'
      case 'all':
        return 'All occurrences in the series (past, present, and future) will be modified.'
      default:
        return ''
    }
  }

  const getOptionWarning = (option: 'this' | 'this-and-future' | 'all') => {
    switch (option) {
      case 'this':
        return 'This will create an exception to the recurring series.'
      case 'this-and-future':
        return 'This will create a new recurring series starting from this date.'
      case 'all':
        return 'This will modify the entire recurring series and may affect many events.'
      default:
        return ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Edit Recurring Event
          </DialogTitle>
          <DialogDescription>
            This event is part of a recurring series. Choose how you want to apply your changes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Summary */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{eventTitle}</span>
                {isRecurringMaster && (
                  <Badge variant="secondary" className="text-xs">
                    Master Event
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(eventStartDate)}
              </div>
              {affectedCount && (
                <div className="text-xs text-muted-foreground">
                  {affectedCount} total occurrence{affectedCount !== 1 ? 's' : ''} in series
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Options */}
          <RadioGroup value={selectedOption} onValueChange={(value: any) => setSelectedOption(value)} className="space-y-3">
            {/* This Event Only */}
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="this" id="this" className="mt-1" />
              <div className="flex-1 space-y-1">
                <Label htmlFor="this" className="text-sm font-medium">
                  This event only
                </Label>
                <p className="text-xs text-muted-foreground">
                  {getOptionDescription('this')}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-amber-600">
                    {getOptionWarning('this')}
                  </span>
                </div>
              </div>
            </div>

            {/* This and Future Events */}
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="this-and-future" id="this-and-future" className="mt-1" />
              <div className="flex-1 space-y-1">
                <Label htmlFor="this-and-future" className="text-sm font-medium">
                  This and all future events
                </Label>
                <p className="text-xs text-muted-foreground">
                  {getOptionDescription('this-and-future')}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-600">
                    {getOptionWarning('this-and-future')}
                  </span>
                </div>
              </div>
            </div>

            {/* All Events */}
            <div className="flex items-start space-x-3 space-y-0">
              <RadioGroupItem value="all" id="all" className="mt-1" />
              <div className="flex-1 space-y-1">
                <Label htmlFor="all" className="text-sm font-medium">
                  All events in series
                </Label>
                <p className="text-xs text-muted-foreground">
                  {getOptionDescription('all')}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-600">
                    {getOptionWarning('all')}
                  </span>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}