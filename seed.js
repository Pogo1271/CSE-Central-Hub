const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Full system access',
      color: 'bg-red-100 text-red-800',
      permissions: {
        tabs: ['dashboard', 'businesses', 'analytics', 'users', 'messages', 'documents', 'tasks', 'settings'],
        features: {
          canViewAllBusinesses: true,
          canCreateBusiness: true,
          canEditBusiness: true,
          canDeleteBusiness: true,
          canViewAllUsers: true,
          canCreateUser: true,
          canEditUser: true,
          canDeleteUser: true,
          canViewAnalytics: true,
          canViewAllMessages: true,
          canViewAllDocuments: true,
          canViewAllTasks: true,
          canAccessSettings: true
        }
      }
    }
  })

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Manage businesses and users',
      color: 'bg-blue-100 text-blue-800',
      permissions: {
        tabs: ['dashboard', 'businesses', 'analytics', 'messages', 'documents', 'tasks'],
        features: {
          canViewAllBusinesses: true,
          canCreateBusiness: true,
          canEditBusiness: true,
          canDeleteBusiness: false,
          canViewAllUsers: false,
          canCreateUser: false,
          canEditUser: false,
          canDeleteUser: false,
          canViewAnalytics: true,
          canViewAllMessages: true,
          canViewAllDocuments: true,
          canViewAllTasks: true,
          canAccessSettings: false
        }
      }
    }
  })

  const userRole = await prisma.role.upsert({
    where: { name: 'User' },
    update: {},
    create: {
      name: 'User',
      description: 'Basic access',
      color: 'bg-green-100 text-green-800',
      permissions: {
        tabs: ['dashboard', 'businesses', 'messages', 'documents', 'tasks'],
        features: {
          canViewAllBusinesses: false,
          canCreateBusiness: false,
          canEditBusiness: false,
          canDeleteBusiness: false,
          canViewAllUsers: false,
          canCreateUser: false,
          canEditUser: false,
          canDeleteUser: false,
          canViewAnalytics: false,
          canViewAllMessages: false,
          canViewAllDocuments: false,
          canViewAllTasks: false,
          canAccessSettings: false
        }
      }
    }
  })

  // Create demo users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@businesshub.com' },
    update: {},
    create: {
      email: 'admin@businesshub.com',
      name: 'Admin User',
      role: 'Admin',
      status: 'Active'
    }
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@businesshub.com' },
    update: {},
    create: {
      email: 'manager@businesshub.com',
      name: 'Manager User',
      role: 'Manager',
      status: 'Active'
    }
  })

  const businessUser = await prisma.user.upsert({
    where: { email: 'business@businesshub.com' },
    update: {},
    create: {
      email: 'business@businesshub.com',
      name: 'Business User',
      role: 'User',
      status: 'Active'
    }
  })

  console.log('Database seeded successfully!')
  console.log('Created roles:', { adminRole, managerRole, userRole })
  console.log('Created users:', { adminUser, managerUser, businessUser })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })