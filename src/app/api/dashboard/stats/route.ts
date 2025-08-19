import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const [businessCount, productCount, taskCount, userCount] = await Promise.all([
      db.business.count(),
      db.product.count(),
      db.task.count(),
      db.user.count()
    ])

    const stats = {
      totalBusinesses: businessCount,
      activeProducts: productCount,
      activeTasks: taskCount,
      totalUsers: userCount
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}