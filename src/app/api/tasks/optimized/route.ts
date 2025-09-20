import { NextRequest, NextResponse } from 'next/server'
import { 
  getRecurringTasks, 
  createRecurringTask, 
  updateRecurringTask,
  getRecurringTaskWithInstances
} from '@/lib/recurring-task-queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assigneeId = searchParams.get('assigneeId')
    const businessId = searchParams.get('businessId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const includeGenerated = searchParams.get('includeGenerated') !== 'false'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const taskId = searchParams.get('taskId') // For single task lookup

    // If single task is requested
    if (taskId) {
      const task = await getRecurringTaskWithInstances(taskId)
      if (!task) {
        return NextResponse.json(
          { error: 'Task not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(task)
    }

    // Parse date parameters
    const parsedStartDate = startDate ? new Date(startDate) : undefined
    const parsedEndDate = endDate ? new Date(endDate) : undefined

    const tasks = await getRecurringTasks({
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      assigneeId: assigneeId || undefined,
      businessId: businessId || undefined,
      status: status || undefined,
      includeGenerated,
      limit
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const tasks = await createRecurringTask({
      title,
      description,
      startDate,
      endDate,
      allDay: allDay || false,
      recurring: recurring || false,
      recurrenceRule,
      businessId,
      assigneeId,
      status: status || 'pending',
      priority: priority || 'medium',
      createdById
    })

    return NextResponse.json(tasks, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      status,
      priority,
      assigneeId,
      businessId,
      editOption = 'this' // Default to 'this' if not specified
    } = body

    const updatedTask = await updateRecurringTask(
      taskId,
      {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        allDay,
        status,
        priority,
        assigneeId,
        businessId
      },
      editOption
    )

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}