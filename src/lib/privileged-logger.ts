import { db } from '@/lib/db'
import { User } from './auth'

export interface PrivilegedLogData {
  userId: string
  action: string
  targetId?: string
  targetEmail?: string
  ipAddress?: string
  userAgent?: string
  details?: string
}

/**
 * Log privileged actions performed by SuperUser or Admin users
 */
export async function logPrivilegedAction(data: PrivilegedLogData): Promise<void> {
  try {
    await db.privilegedLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        targetId: data.targetId,
        targetEmail: data.targetEmail,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        details: data.details
      }
    })
  } catch (error) {
    console.error('Failed to log privileged action:', error)
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Check if user is a privileged user (SuperUser or Admin)
 */
export function isPrivilegedUser(user: User | null): boolean {
  if (!user) return false
  return user.role === 'SuperUser' || user.role === 'Admin'
}

/**
 * Get privileged logs for auditing
 */
export async function getPrivilegedLogs(limit: number = 100) {
  try {
    return await db.privilegedLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    })
  } catch (error) {
    console.error('Failed to get privileged logs:', error)
    return []
  }
}