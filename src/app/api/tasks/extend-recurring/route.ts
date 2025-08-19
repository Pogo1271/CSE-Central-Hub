import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// This endpoint checks for recurring tasks that need to be extended
// and creates new instances when approaching the recurrence end date
export async function POST(request: NextRequest) {
  try {
    // Find all recurring parent tasks that are approaching their recurrence end date
    const ninetyDaysFromNow = new Date()
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)
    
    const expiringRecurringTasks = await db.task.findMany({
      where: {
        recurring: true,
        recurrenceEndDate: {
          lte: ninetyDaysFromNow
        },
        parentTaskId: null // Only parent tasks
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    console.log(`Found ${expiringRecurringTasks.length} recurring tasks approaching expiration`)
    
    const extendedTasks = []
    
    for (const task of expiringRecurringTasks) {
      console.log(`Processing expiring task: ${task.title} (ends: ${task.recurrenceEndDate})`)
      
      // Extend the recurrence by another 2 years (or 4 years for 3-week cycles)
      const currentEndDate = new Date(task.recurrenceEndDate)
      const yearsToExtend = task.recurringPattern?.startsWith('custom-') && task.recurringPattern.includes('3') ? 4 : 2
      const newEndDate = new Date(currentEndDate)
      newEndDate.setFullYear(newEndDate.getFullYear() + yearsToExtend)
      
      // Update the recurrence end date
      const updatedTask = await db.task.update({
        where: { id: task.id },
        data: {
          recurrenceEndDate: newEndDate
        }
      })
      
      // Create new task instances from the current end date to the new end date
      const baseDate = new Date(currentEndDate)
      const createdInstances = []
      
      let currentDate = new Date(baseDate)
      let i = 1
      
      while (currentDate < newEndDate) {
        let nextDate = new Date(currentDate)
        
        switch (task.recurringPattern) {
          case 'daily':
            nextDate.setDate(currentDate.getDate() + 1)
            break
          case 'weekly':
            nextDate.setDate(currentDate.getDate() + 7)
            break
          case 'monthly':
            nextDate.setMonth(currentDate.getMonth() + 1)
            if (nextDate.getDate() !== currentDate.getDate()) {
              nextDate.setDate(0)
            }
            break
          case 'yearly':
            nextDate.setFullYear(currentDate.getFullYear() + 1)
            if (nextDate.getMonth() !== currentDate.getMonth()) {
              nextDate.setMonth(1)
              nextDate.setDate(29)
              if (nextDate.getMonth() !== 1) {
                nextDate.setDate(28)
              }
            }
            break
          default:
            if (task.recurringPattern?.startsWith('custom-')) {
              const weeks = parseInt(task.recurringPattern.split('-')[1]) || 1
              nextDate.setDate(currentDate.getDate() + (weeks * 7))
            } else {
              break
            }
        }
        
        if (nextDate > newEndDate) break
        
        // Create the new recurring task instance
        const recurringTask = await db.task.create({
          data: {
            title: task.title,
            description: task.description,
            startDate: nextDate,
            endDate: task.endDate ? new Date(nextDate.getTime() + (new Date(task.endDate).getTime() - baseDate.getTime())) : null,
            allDay: task.allDay,
            recurring: false,
            recurringPattern: null,
            parentTaskId: task.id,
            businessId: task.businessId,
            assigneeId: task.assigneeId,
            status: 'pending',
            priority: task.priority
          }
        })
        
        createdInstances.push(recurringTask)
        currentDate = nextDate
        i++
      }
      
      console.log(`Extended task ${task.title} to ${newEndDate.toISOString()} and created ${createdInstances.length} new instances`)
      
      extendedTasks.push({
        task: updatedTask,
        newInstances: createdInstances
      })
    }
    
    return NextResponse.json({
      message: `Extended ${extendedTasks.length} recurring tasks`,
      extendedTasks
    })
    
  } catch (error) {
    console.error('Error extending recurring tasks:', error)
    return NextResponse.json(
      { error: 'Failed to extend recurring tasks' },
      { status: 500 }
    )
  }
}