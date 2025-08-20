import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const task = await db.task.findUnique({
      where: { id: (await params).id },
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

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const existingTask = await db.task.findUnique({
      where: { id: (await params).id }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    const task = await db.task.update({
      where: { id: (await params).id },
      data: {
        title: title !== undefined ? title : existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existingTask.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existingTask.endDate,
        allDay: allDay !== undefined ? allDay : existingTask.allDay,
        recurring: recurring !== undefined ? recurring : existingTask.recurring,
        recurringPattern: recurringPattern !== undefined ? recurringPattern : existingTask.recurringPattern,
        businessId: businessId !== undefined ? businessId : existingTask.businessId,
        assigneeId: assigneeId !== undefined ? assigneeId : existingTask.assigneeId,
        status: status !== undefined ? status : existingTask.status,
        priority: priority !== undefined ? priority : existingTask.priority
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

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const existingTask = await db.task.findUnique({
      where: { id: (await params).id }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    await db.task.delete({
      where: { id: (await params).id }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}