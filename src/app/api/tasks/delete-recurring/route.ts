import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    console.log('Deleting recurring task chain for task:', taskId)

    // First, find the task to determine if it's a parent or child task
    const task = await db.task.findUnique({
      where: { id: taskId },
      include: {
        parentTask: true,
        instances: true
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    let deletedTasks = []
    
    if (task.parentTaskId) {
      // This is a child task - delete the entire chain starting from the parent
      const parentTask = await db.task.findUnique({
        where: { id: task.parentTaskId },
        include: {
          instances: true
        }
      })
      
      if (parentTask) {
        // Delete all child instances first
        const childTasks = await db.task.findMany({
          where: { parentTaskId: parentTask.id }
        })
        
        for (const child of childTasks) {
          await db.task.delete({ where: { id: child.id } })
          deletedTasks.push(child.id)
        }
        
        // Delete the parent task
        await db.task.delete({ where: { id: parentTask.id } })
        deletedTasks.push(parentTask.id)
        
        console.log('Deleted entire recurring task chain:', deletedTasks.length, 'tasks')
      }
    } else if (task.recurring && task.instances.length > 0) {
      // This is a parent task - delete all instances
      const childTasks = await db.task.findMany({
        where: { parentTaskId: task.id }
      })
      
      for (const child of childTasks) {
        await db.task.delete({ where: { id: child.id } })
        deletedTasks.push(child.id)
      }
      
      // Delete the parent task
      await db.task.delete({ where: { id: task.id } })
      deletedTasks.push(task.id)
      
      console.log('Deleted parent task and all instances:', deletedTasks.length, 'tasks')
    } else {
      // This is a single task, just delete it
      await db.task.delete({ where: { id: task.id } })
      deletedTasks.push(task.id)
      
      console.log('Deleted single task:', task.id)
    }

    return NextResponse.json({ 
      message: 'Recurring task chain deleted successfully',
      deletedTasks: deletedTasks.length,
      taskIds: deletedTasks
    })
  } catch (error) {
    console.error('Error deleting recurring task chain:', error)
    return NextResponse.json(
      { error: 'Failed to delete recurring task chain' },
      { status: 500 }
    )
  }
}