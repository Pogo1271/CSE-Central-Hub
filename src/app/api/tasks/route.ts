import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getCurrentUser } from '@/lib/middleware'
import { 
  generateRecurringInstances, 
  parseRRULE, 
  toRRULE, 
  getRecurrenceDescription,
  type RecurrenceRule 
} from '@/lib/recurrence-utils'

async function getTasksHandler(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request)

    const { searchParams } = new URL(request.url)
    const assigneeId = searchParams.get('assigneeId')
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const includeRecurring = searchParams.get('includeRecurring') === 'true'
    const expandInstances = searchParams.get('expandInstances') === 'true'

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
    
    // For recurring tasks, we need special handling
    if (includeRecurring) {
      // Get both master tasks and individual instances
      whereClause.OR = [
        { isRecurringMaster: true },
        { isRecurringMaster: false, parentTaskId: null }
      ]
    } else {
      // Only get non-recurring or individual instances
      whereClause.OR = [
        { recurring: false },
        { isException: true }
      ]
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
            recurringPattern: true,
            recurrenceRule: true,
            isRecurringMaster: true
          }
        },
        instances: {
          select: {
            id: true,
            startDate: true,
            status: true
          }
        },
        exceptions: {
          select: {
            id: true,
            exceptionDate: true,
            exceptionType: true,
            notes: true
          }
        }
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    // If expandInstances is true, generate recurring instances for master tasks
    if (expandInstances) {
      const expandedTasks = [...tasks]
      
      for (const task of tasks) {
        if (task.isRecurringMaster && task.recurrenceRule) {
          try {
            const rule = parseRRULE(task.recurrenceRule)
            const instances = generateRecurringInstances({
              startDate: new Date(task.startDate!),
              endDate: task.recurrenceEndDate ? new Date(task.recurrenceEndDate) : undefined,
              rule,
              excludeDates: task.exceptions
                .filter(ex => ex.exceptionType === 'cancelled')
                .map(ex => new Date(ex.exceptionDate))
            })
            
            // Add generated instances to the results
            for (const instance of instances) {
              // Check if this instance already exists as an exception
              const existingException = task.exceptions.find(
                ex => isSameDay(new Date(ex.exceptionDate), instance.startDate)
              )
              
              if (!existingException) {
                expandedTasks.push({
                  ...task,
                  id: `${task.id}_${instance.startDate.toISOString()}`,
                  startDate: instance.startDate,
                  endDate: instance.endDate,
                  isGeneratedInstance: true,
                  parentTaskId: task.id
                })
              }
            }
          } catch (error) {
            console.error('Error generating recurring instances for task:', task.id, error)
          }
        }
      }
      
      return NextResponse.json(expandedTasks)
    }

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

async function createTaskHandler(request: NextRequest) {
  try {
    // Add debugging
    const currentUser = getCurrentUser(request)
    console.log('Create Task API - Current user:', currentUser)

    const body = await request.json()
    console.log('Create Task API - Request body:', body)
    
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      recurring,
      recurrenceRule,
      businessId,
      assigneeId,
      status,
      priority,
      createdById
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const tasks = []

    // Parse recurrence rule if provided
    let parsedRule: RecurrenceRule | null = null
    if (recurrenceRule) {
      try {
        parsedRule = parseRRULE(recurrenceRule)
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid recurrence rule format' },
          { status: 400 }
        )
      }
    }

    // Create the main task
    const mainTask = await db.task.create({
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        allDay: allDay || false,
        recurring: recurring || false,
        recurrenceRule,
        isRecurringMaster: recurring && parsedRule ? true : false,
        recurrenceInterval: parsedRule?.interval,
        recurrenceCount: parsedRule?.count,
        recurrenceEndDate: parsedRule?.endDate,
        recurrenceCustomDays: parsedRule?.customDays ? JSON.stringify(parsedRule.customDays) : null,
        businessId,
        assigneeId,
        createdById: createdById || currentUser?.id,
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
            recurringPattern: true,
            recurrenceRule: true,
            isRecurringMaster: true
          }
        },
        instances: {
          select: {
            id: true,
            startDate: true,
            status: true
          }
        },
        exceptions: {
          select: {
            id: true,
            exceptionDate: true,
            exceptionType: true,
            notes: true
          }
        }
      }
    })

    tasks.push(mainTask)

    // If recurring, create additional task instances
    if (recurring && parsedRule && startDate) {
      try {
        const instances = generateRecurringInstances({
          startDate: new Date(startDate),
          endDate: parsedRule.endDate,
          rule: parsedRule
        })

        // Create instances (skip the first one as it's the main task)
        for (let i = 1; i < instances.length; i++) {
          const instance = instances[i]
          
          const recurringTask = await db.task.create({
            data: {
              title,
              description,
              startDate: instance.startDate,
              endDate: instance.endDate,
              allDay: allDay || false,
              recurring: false, // Individual instances are not recurring
              parentTaskId: mainTask.id, // Link to the parent task
              businessId,
              assigneeId, // Keep the same assignee for all instances
              createdById: createdById || currentUser?.id,
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
                  recurringPattern: true,
                  recurrenceRule: true,
                  isRecurringMaster: true
                }
              }
            }
          })
          
          tasks.push(recurringTask)
        }
      } catch (error) {
        console.error('Error creating recurring instances:', error)
      }
    }

    console.log('Create Task API - Created tasks:', tasks.length)
    return NextResponse.json(tasks, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

// Export the wrapped handlers
export const GET = withAuth(getTasksHandler)
export const POST = withAuth(createTaskHandler)