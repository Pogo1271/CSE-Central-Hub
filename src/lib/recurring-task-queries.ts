import { db } from '@/lib/db'
import { 
  generateRecurringInstances, 
  parseRRULE, 
  getRecurrenceDescription,
  type RecurrenceRule 
} from '@/lib/recurrence-utils'
import { addDays, startOfDay, endOfDay, isSameDay, parseISO } from 'date-fns'

interface RecurringTaskQueryOptions {
  startDate?: Date
  endDate?: Date
  assigneeId?: string
  businessId?: string
  status?: string
  includeGenerated?: boolean
  limit?: number
}

interface RecurringTaskResult {
  id: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  allDay: boolean
  recurring: boolean
  isRecurringMaster: boolean
  isGeneratedInstance?: boolean
  parentTaskId?: string
  status: string
  priority: string
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
  recurrenceRule?: string
  recurrenceDescription?: string
  exceptions?: Array<{
    id: string
    exceptionDate: Date
    exceptionType: string
    notes?: string
  }>
}

/**
 * Optimized query for fetching tasks with recurring instances
 */
export async function getRecurringTasks(options: RecurringTaskQueryOptions = {}): Promise<RecurringTaskResult[]> {
  const {
    startDate,
    endDate,
    assigneeId,
    businessId,
    status,
    includeGenerated = true,
    limit
  } = options

  // Set default date range if not provided
  const queryStartDate = startDate || startOfDay(addDays(new Date(), -90)) // 90 days ago
  const queryEndDate = endDate || endOfDay(addDays(new Date(), 365)) // 1 year from now

  // Build where clause for base query
  const whereClause: any = {
    OR: [
      // Non-recurring tasks within date range
      {
        recurring: false,
        startDate: {
          gte: queryStartDate,
          lte: queryEndDate
        }
      },
      // Recurring master tasks
      {
        isRecurringMaster: true
      },
      // Exception tasks
      {
        isException: true
      }
    ]
  }

  // Add optional filters
  if (assigneeId) {
    whereClause.AND = whereClause.AND || []
    whereClause.AND.push({ assigneeId })
  }

  if (businessId) {
    whereClause.AND = whereClause.AND || []
    whereClause.AND.push({ businessId })
  }

  if (status) {
    whereClause.AND = whereClause.AND || []
    whereClause.AND.push({ status })
  }

  // Fetch base tasks
  const baseTasks = await db.task.findMany({
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
      business: {
        select: {
          id: true,
          name: true
        }
      },
      exceptions: {
        select: {
          id: true,
          exceptionDate: true,
          exceptionType: true,
          notes: true
        }
      },
      parentTask: {
        select: {
          id: true,
          title: true,
          recurrenceRule: true,
          isRecurringMaster: true
        }
      }
    },
    orderBy: {
      startDate: 'asc'
    },
    take: limit
  })

  // Process and expand recurring tasks
  const results: RecurringTaskResult[] = []

  for (const task of baseTasks) {
    if (task.isRecurringMaster && task.recurrenceRule && includeGenerated) {
      // Generate recurring instances for master tasks
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

        // Add instances within query date range
        for (const instance of instances) {
          if (instance.startDate >= queryStartDate && instance.startDate <= queryEndDate) {
            // Check if this instance has an exception
            const exception = task.exceptions.find(
              ex => isSameDay(new Date(ex.exceptionDate), instance.startDate)
            )

            if (!exception || exception.exceptionType === 'modified') {
              results.push({
                id: exception?.newTaskId || `${task.id}_${instance.startDate.toISOString()}`,
                title: task.title,
                description: task.description,
                startDate: instance.startDate,
                endDate: instance.endDate,
                allDay: task.allDay,
                recurring: false,
                isRecurringMaster: false,
                isGeneratedInstance: !exception?.newTaskId,
                parentTaskId: task.id,
                status: exception?.newTaskId ? 'modified' : task.status,
                priority: task.priority,
                assignee: task.assignee,
                business: task.business,
                recurrenceRule: task.recurrenceRule,
                recurrenceDescription: getRecurrenceDescription(rule),
                exceptions: task.exceptions
              })
            }
          }
        }
      } catch (error) {
        console.error('Error processing recurring task:', task.id, error)
        // Add the master task as fallback
        results.push(mapTaskToResult(task))
      }
    } else {
      // Add non-recurring tasks and exceptions as-is
      results.push(mapTaskToResult(task))
    }
  }

  // Sort results by start date
  return results.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
}

/**
 * Get a single recurring task with all its instances
 */
export async function getRecurringTaskWithInstances(taskId: string): Promise<RecurringTaskResult | null> {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          color: true
        }
      },
      business: {
        select: {
          id: true,
          name: true
        }
      },
      exceptions: {
        select: {
          id: true,
          exceptionDate: true,
          exceptionType: true,
          notes: true
        },
        orderBy: {
          exceptionDate: 'asc'
        }
      },
      instances: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          priority: true
        },
        orderBy: {
          startDate: 'asc'
        }
      }
    }
  })

  if (!task) return null

  const result = mapTaskToResult(task)

  // Add recurrence description if it's a recurring master
  if (task.isRecurringMaster && task.recurrenceRule) {
    try {
      const rule = parseRRULE(task.recurrenceRule)
      result.recurrenceDescription = getRecurrenceDescription(rule)
    } catch (error) {
      console.error('Error parsing recurrence rule:', error)
    }
  }

  return result
}

/**
 * Create a recurring task with optimized instance generation
 */
export async function createRecurringTask(data: any): Promise<RecurringTaskResult[]> {
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
  } = data

  const results: RecurringTaskResult[] = []

  // Parse recurrence rule if provided
  let parsedRule: RecurrenceRule | null = null
  if (recurrenceRule) {
    try {
      parsedRule = parseRRULE(recurrenceRule)
    } catch (error) {
      throw new Error('Invalid recurrence rule format')
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
      createdById,
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
      business: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  results.push(mapTaskToResult(mainTask))

  // If recurring, generate instances in batches for better performance
  if (recurring && parsedRule && startDate) {
    try {
      const instances = generateRecurringInstances({
        startDate: new Date(startDate),
        endDate: parsedRule.endDate,
        rule: parsedRule
      })

      // Create instances in batches of 50 to avoid overwhelming the database
      const batchSize = 50
      for (let i = 1; i < instances.length; i += batchSize) {
        const batch = instances.slice(i, i + batchSize)
        
        const batchData = batch.map(instance => ({
          title,
          description,
          startDate: instance.startDate,
          endDate: instance.endDate,
          allDay: allDay || false,
          recurring: false,
          parentTaskId: mainTask.id,
          businessId,
          assigneeId,
          createdById,
          status: status || 'pending',
          priority: priority || 'medium'
        }))

        await db.task.createMany({
          data: batchData
        })
      }

      // If we created instances, fetch them to include in results
      if (instances.length > 1) {
        const createdInstances = await db.task.findMany({
          where: {
            parentTaskId: mainTask.id
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
            business: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            startDate: 'asc'
          }
        })

        results.push(...createdInstances.map(mapTaskToResult))
      }
    } catch (error) {
      console.error('Error creating recurring instances:', error)
    }
  }

  return results
}

/**
 * Update a recurring task with proper handling of series vs individual instances
 */
export async function updateRecurringTask(
  taskId: string,
  data: any,
  editOption: 'this' | 'this-and-future' | 'all' = 'this'
): Promise<RecurringTaskResult> {
  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      parentTask: true,
      instances: true
    }
  })

  if (!task) {
    throw new Error('Task not found')
  }

  let updatedTask

  switch (editOption) {
    case 'this':
      // Update only this instance (create exception if it's part of a series)
      if (task.parentTaskId) {
        // This is an instance of a recurring series
        updatedTask = await db.task.update({
          where: { id: taskId },
          data: {
            ...data,
            isException: true,
            modifiedFields: JSON.stringify(Object.keys(data))
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
            business: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })

        // Create exception record
        await db.taskException.create({
          data: {
            taskId: task.parentTaskId,
            exceptionDate: new Date(task.startDate!),
            exceptionType: 'modified',
            newTaskId: taskId,
            modifiedFields: JSON.stringify(Object.keys(data))
          }
        })
      } else {
        // This is a standalone task or master task
        updatedTask = await db.task.update({
          where: { id: taskId },
          data,
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                color: true
              }
            },
            business: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })
      }
      break

    case 'this-and-future':
      // Update this instance and all future instances
      if (task.parentTaskId) {
        // Create new recurring series starting from this instance
        const newMasterTask = await db.task.create({
          data: {
            ...task.parentTask,
            id: undefined, // Let database generate new ID
            title: data.title || task.title,
            description: data.description || task.description,
            startDate: new Date(task.startDate!),
            recurrenceRule: task.parentTask?.recurrenceRule,
            isRecurringMaster: true,
            parentTaskId: null,
            status: data.status || task.status,
            priority: data.priority || task.priority,
            assigneeId: data.assigneeId || task.assigneeId,
            businessId: data.businessId || task.businessId
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
            business: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })

        // Mark original instance as exception
        await db.task.update({
          where: { id: taskId },
          data: {
            parentTaskId: newMasterTask.id,
            isException: true
          }
        })

        // Create exception record
        await db.taskException.create({
          data: {
            taskId: task.parentTaskId!,
            exceptionDate: new Date(task.startDate!),
            exceptionType: 'moved',
            newTaskId: newMasterTask.id,
            notes: 'Split into new series'
          }
        })

        updatedTask = newMasterTask
      } else {
        // Update master task and all future instances
        updatedTask = await db.task.update({
          where: { id: taskId },
          data: {
            ...data,
            // Update all future instances
            instances: {
              updateMany: {
                where: {
                  startDate: {
                    gte: new Date(task.startDate!)
                  }
                },
                data: {
                  title: data.title,
                  description: data.description,
                  status: data.status,
                  priority: data.priority,
                  assigneeId: data.assigneeId,
                  businessId: data.businessId
                }
              }
            }
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
            business: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })
      }
      break

    case 'all':
      // Update all instances in the series
      if (task.parentTaskId) {
        // Update the master task
        const masterTask = await db.task.update({
          where: { id: task.parentTaskId },
          data,
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                color: true
              }
            },
            business: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })

        // Update all instances
        await db.task.updateMany({
          where: {
            OR: [
              { parentTaskId: task.parentTaskId },
              { id: task.parentTaskId }
            ]
          },
          data: {
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            assigneeId: data.assigneeId,
            businessId: data.businessId
          }
        })

        updatedTask = masterTask
      } else {
        // Update this task and all its instances
        updatedTask = await db.task.update({
          where: { id: taskId },
          data: {
            ...data,
            instances: {
              updateMany: {
                data: {
                  title: data.title,
                  description: data.description,
                  status: data.status,
                  priority: data.priority,
                  assigneeId: data.assigneeId,
                  businessId: data.businessId
                }
              }
            }
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
            business: {
              select: {
                id: true,
                name: true
              }
            }
          }
        })
      }
      break
  }

  return mapTaskToResult(updatedTask)
}

/**
 * Helper function to map database task to result format
 */
function mapTaskToResult(task: any): RecurringTaskResult {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    startDate: new Date(task.startDate),
    endDate: task.endDate ? new Date(task.endDate) : undefined,
    allDay: task.allDay,
    recurring: task.recurring,
    isRecurringMaster: task.isRecurringMaster,
    parentTaskId: task.parentTaskId,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    business: task.business,
    recurrenceRule: task.recurrenceRule,
    exceptions: task.exceptions
  }
}