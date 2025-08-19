import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assigneeId = searchParams.get('assigneeId')
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let whereClause: any = {}
    
    if (assigneeId) {
      whereClause.assigneeId = assigneeId
    }
    
    if (businessId) {
      whereClause.businessId = businessId
    }
    
    if (status) {
      whereClause.status = status
    }
    
    // Add date range filtering for better performance
    if (startDate && endDate) {
      whereClause.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      // Default to showing a wide range if only startDate is specified
      // Match frontend expectations: from startDate to 2+ years in the future
      const start = new Date(startDate)
      const end = new Date(start)
      end.setFullYear(end.getFullYear() + 2)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0) // Last day of the month
      whereClause.startDate = {
        gte: start,
        lte: end
      }
    } else {
      // Default to showing a wide range to match frontend expectations
      // Frontend loads from 3 months ago to 2+ years in the future
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1) // 3 months ago
      const end = new Date(now.getFullYear() + 2, now.getMonth() + 1, 0) // 2+ years in the future
      whereClause.startDate = {
        gte: start,
        lte: end
      }
    }

    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            color: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        business: {
          select: {
            id: true,
            name: true
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            recurring: true,
            recurringPattern: true
          }
        },
        instances: {
          select: {
            id: true,
            startDate: true,
            status: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      recurring,
      recurringPattern,
      businessId,
      assigneeId,
      status,
      priority
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const tasks = []

    // Create the main task
    const mainTask = await db.task.create({
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay || false,
        recurring: recurring || false,
        recurringPattern,
        businessId,
        assigneeId,
        status: status || 'pending',
        priority: priority || 'medium'
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            color: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        business: {
          select: {
            id: true,
            name: true
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            recurring: true,
            recurringPattern: true
          }
        },
        instances: {
          select: {
            id: true,
            startDate: true,
            status: true
          }
        }
      }
    })

    tasks.push(mainTask)

    // If recurring, create additional task instances
    if (recurring && recurringPattern && startDate) {
      console.log('Creating recurring tasks with pattern:', recurringPattern)
      const baseDate = new Date(startDate)
      const createdTasks = [mainTask]
      
      // For forever repeating tasks, create instances for 5 years
      // This provides a good balance between "forever" and practical database management
      const yearsToCreate = 5
      let currentDate = new Date(baseDate)
      const recurrenceEndDate = new Date(baseDate)
      recurrenceEndDate.setFullYear(recurrenceEndDate.getFullYear() + yearsToCreate)
      
      // Store the recurrence end date in the main task for reference
      await db.task.update({
        where: { id: mainTask.id },
        data: {
          recurrenceEndDate: recurrenceEndDate
        }
      })
      
      // For weekly repeating tasks, ensure we create at least 52 instances (1 year worth)
      // This addresses the specific issue of only seeing 3 events for weekly repeats
      const minInstances = recurringPattern === 'weekly' ? 52 : 
                          recurringPattern === 'daily' ? 365 : 
                          recurringPattern === 'monthly' ? 60 : 
                          recurringPattern === 'yearly' ? 10 : 52
      
      let i = 1
      console.log('Starting recurrence loop from', currentDate.toISOString(), 'to', recurrenceEndDate.toISOString())
      
      while (currentDate < recurrenceEndDate || i < minInstances) {
        let nextDate = new Date(currentDate)
        
        switch (recurringPattern) {
          case 'daily':
            nextDate.setDate(currentDate.getDate() + 1)
            break
          case 'weekly':
            nextDate.setDate(currentDate.getDate() + 7)
            break
          case 'monthly':
            // Set to same day next month, but handle edge cases (e.g., Jan 31 -> Feb 28/29)
            nextDate = new Date(currentDate)
            nextDate.setMonth(currentDate.getMonth() + 1)
            // If the day changed, it means we rolled over to the next month (e.g., Jan 31 -> Mar 3)
            // In that case, set to the last day of the previous month
            if (nextDate.getDate() !== currentDate.getDate()) {
              nextDate.setDate(0) // Set to last day of previous month
            }
            console.log(`Monthly: from ${currentDate.toISOString()} to ${nextDate.toISOString()}, day changed: ${nextDate.getDate() !== currentDate.getDate()}`)
            break
          case 'yearly':
            // Set to same day next year, handle leap years for Feb 29th
            const originalDay = currentDate.getDate()
            nextDate.setFullYear(currentDate.getFullYear() + 1)
            // Check if we're in a different month (e.g., Feb 29 -> Mar 1 in non-leap year)
            if (nextDate.getMonth() !== currentDate.getMonth()) {
              // Set to last day of February for leap year cases
              nextDate.setMonth(1) // February
              nextDate.setDate(29) // Try Feb 29
              if (nextDate.getMonth() !== 1) { // If not February, set to Feb 28
                nextDate.setDate(28)
              }
            }
            break
          default:
            if (recurringPattern.startsWith('custom-')) {
              const weeks = parseInt(recurringPattern.split('-')[1]) || 1
              nextDate.setDate(currentDate.getDate() + (weeks * 7))
            } else {
              break
            }
        }
        
        // Don't create if we've exceeded the limit and minimum instances are met
        if (nextDate > recurrenceEndDate && i >= minInstances) {
          console.log(`Stopping recurrence: nextDate ${nextDate.toISOString()} exceeds endDate ${recurrenceEndDate.toISOString()} and minimum instances met`)
          break
        }
        
        console.log(`Creating task ${i} for date:`, nextDate.toISOString())
        
        // Create the recurring task instance
        const recurringTask = await db.task.create({
          data: {
            title,
            description,
            startDate: nextDate,
            endDate: endDate ? new Date(nextDate.getTime() + (new Date(endDate).getTime() - baseDate.getTime())) : null,
            allDay: allDay || false,
            recurring: false, // Individual instances are not recurring
            recurringPattern: null,
            parentTaskId: mainTask.id, // Link to the parent task
            businessId,
            assigneeId, // Keep the same assignee for all instances
            status: status || 'pending',
            priority: priority || 'medium'
          },
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                color: true
              }
            },
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            business: {
              select: {
                id: true,
                name: true
              }
            },
            parentTask: {
              select: {
                id: true,
                title: true,
                recurring: true,
                recurringPattern: true
              }
            },
            instances: {
              select: {
                id: true,
                startDate: true,
                status: true
              }
            }
          }
        })
        
        createdTasks.push(recurringTask)
        currentDate = nextDate
        i++
      }
      
      console.log('Created', createdTasks.length, 'recurring tasks')
      return NextResponse.json(createdTasks, { status: 201 })
    }

    return NextResponse.json([mainTask], { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}