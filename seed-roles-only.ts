import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedRoles() {
  console.log('Seeding roles...')

  try {
    // Create default roles
    const adminRole = await prisma.role.upsert({
      where: { name: 'Admin' },
      update: {},
      create: {
        name: 'Admin',
        description: 'Full system access',
        color: '#EF4444',
        permissions: {
          tabs: ['dashboard', 'businesses', 'inventory', 'tasks', 'users', 'quotes', 'documents', 'messages', 'analytics', 'settings'],
          features: {
            canCreateBusiness: true,
            canViewAllUsers: true,
            canCreateUser: true,
            canViewAnalytics: true,
            canAccessSettings: true
          }
        }
      },
    })

    const managerRole = await prisma.role.upsert({
      where: { name: 'Manager' },
      update: {},
      create: {
        name: 'Manager',
        description: 'Limited admin access',
        color: '#F59E0B',
        permissions: {
          tabs: ['dashboard', 'businesses', 'inventory', 'tasks', 'quotes', 'documents', 'messages', 'analytics'],
          features: {
            canCreateBusiness: true,
            canViewAllUsers: false,
            canCreateUser: true,
            canViewAnalytics: true,
            canAccessSettings: false
          }
        }
      },
    })

    const userRole = await prisma.role.upsert({
      where: { name: 'User' },
      update: {},
      create: {
        name: 'User',
        description: 'Basic user access',
        color: '#3B82F6',
        permissions: {
          tabs: ['dashboard', 'businesses', 'inventory', 'tasks', 'quotes', 'documents', 'messages'],
          features: {
            canCreateBusiness: false,
            canViewAllUsers: false,
            canCreateUser: false,
            canViewAnalytics: false,
            canAccessSettings: false
          }
        }
      },
    })

    console.log('Roles seeded successfully!')
    console.log('Created roles:', [adminRole.name, managerRole.name, userRole.name])
  } catch (error) {
    console.error('Error seeding roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedRoles()