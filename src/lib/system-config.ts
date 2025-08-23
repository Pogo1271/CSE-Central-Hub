import { db } from '@/lib/db'

export interface SystemConfig {
  key: string
  value: string
  description?: string
  updatedAt: Date
}

/**
 * Get a system configuration value
 */
export async function getSystemConfig(key: string): Promise<string | null> {
  try {
    const config = await db.systemConfig.findUnique({
      where: { key }
    })
    
    return config?.value || null
  } catch (error) {
    console.error('Failed to get system config:', error)
    return null
  }
}

/**
 * Set a system configuration value
 */
export async function setSystemConfig(key: string, value: string, description?: string): Promise<void> {
  try {
    await db.systemConfig.upsert({
      where: { key },
      update: { 
        value,
        description,
        updatedAt: new Date()
      },
      create: {
        key,
        value,
        description,
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Failed to set system config:', error)
    throw error
  }
}

/**
 * Check if SuperUser access is disabled
 */
export async function isSuperUserDisabled(): Promise<boolean> {
  const disabled = await getSystemConfig('superuser_disabled')
  return disabled === 'true'
}

/**
 * Disable SuperUser access (emergency mechanism)
 */
export async function disableSuperUserAccess(reason?: string): Promise<void> {
  await setSystemConfig('superuser_disabled', 'true', reason || 'SuperUser access disabled via emergency mechanism')
}

/**
 * Enable SuperUser access
 */
export async function enableSuperUserAccess(): Promise<void> {
  await setSystemConfig('superuser_disabled', 'false', 'SuperUser access re-enabled')
}

/**
 * Get all system configurations
 */
export async function getAllSystemConfigs(): Promise<SystemConfig[]> {
  try {
    return await db.systemConfig.findMany({
      orderBy: { key: 'asc' }
    })
  } catch (error) {
    console.error('Failed to get system configs:', error)
    return []
  }
}