"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface EnhancedTooltipContentProps {
  title?: string
  description?: string
  status?: string
  priority?: string
  assignee?: {
    name: string
    color?: string
  }
  business?: {
    name: string
  }
  startDate?: string
  endDate?: string
  className?: string
  children?: React.ReactNode
}

function EnhancedTooltipProvider({
  delayDuration = 200,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="enhanced-tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function EnhancedTooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <EnhancedTooltipProvider>
      <TooltipPrimitive.Root data-slot="enhanced-tooltip" {...props} />
    </EnhancedTooltipProvider>
  )
}

function EnhancedTooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="enhanced-tooltip-trigger" {...props} />
}

function EnhancedTooltipContent({
  title,
  description,
  status,
  priority,
  assignee,
  business,
  startDate,
  endDate,
  className,
  children,
  ...props
}: EnhancedTooltipContentProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
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

  const formatTime = (dateString?: string) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="enhanced-tooltip-content"
        sideOffset={12}
        className={cn(
          // Modern glassmorphism design with subtle shadow and border
          "relative z-50 max-w-sm overflow-hidden rounded-xl border border-gray-200/50 bg-white/95 backdrop-blur-sm shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {/* Header with gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="p-4 space-y-3">
          {/* Title Section */}
          {title && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                  {title}
                </h4>
                {assignee?.color && (
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: assignee.color }}
                  />
                )}
              </div>
              {description && (
                <p className="text-xs text-gray-600 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Metadata Section */}
          <div className="space-y-2">
            {/* Status and Priority Badges */}
            <div className="flex flex-wrap gap-2">
              {status && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-md border",
                    getStatusColor(status)
                  )}
                >
                  {status}
                </Badge>
              )}
              {priority && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-medium px-2 py-1 rounded-md border",
                    getPriorityColor(priority)
                  )}
                >
                  {priority}
                </Badge>
              )}
            </div>

            {/* Assignee and Business */}
            <div className="space-y-1">
              {assignee && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Assignee:</span>
                  <span className="text-xs text-gray-700 font-medium">
                    {assignee.name}
                  </span>
                </div>
              )}
              {business && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Business:</span>
                  <span className="text-xs text-gray-700 font-medium">
                    {business.name}
                  </span>
                </div>
              )}
            </div>

            {/* Date Information */}
            {(startDate || endDate) && (
              <div className="space-y-1 pt-2 border-t border-gray-100">
                {startDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">Start:</span>
                    <div className="text-right">
                      <div className="text-xs text-gray-700 font-medium">
                        {formatDate(startDate)}
                      </div>
                      {formatTime(startDate) && (
                        <div className="text-xs text-gray-500">
                          {formatTime(startDate)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">End:</span>
                    <div className="text-right">
                      <div className="text-xs text-gray-700 font-medium">
                        {formatDate(endDate)}
                      </div>
                      {formatTime(endDate) && (
                        <div className="text-xs text-gray-500">
                          {formatTime(endDate)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Custom Content */}
          {children && (
            <div className="pt-2 border-t border-gray-100">
              {children}
            </div>
          )}
        </div>

        {/* Enhanced Arrow with styling */}
        <TooltipPrimitive.Arrow 
          className="fill-white/95 stroke-gray-200/50 stroke-1 z-50" 
          width={12} 
          height={8}
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { 
  EnhancedTooltip, 
  EnhancedTooltipTrigger, 
  EnhancedTooltipContent, 
  EnhancedTooltipProvider 
}