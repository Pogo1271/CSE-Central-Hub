const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
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

  // Create demo users with proper passwords
  const adminPassword = await bcrypt.hash('admin123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const userPassword = await bcrypt.hash('user123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@businesshub.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@businesshub.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'Admin',
      status: 'Active',
      color: '#EF4444'
    }
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@businesshub.com' },
    update: { password: managerPassword },
    create: {
      email: 'manager@businesshub.com',
      password: managerPassword,
      name: 'Manager User',
      role: 'Manager',
      status: 'Active',
      color: '#F59E0B'
    }
  })

  const businessUser = await prisma.user.upsert({
    where: { email: 'user@businesshub.com' },
    update: { password: userPassword },
    create: {
      email: 'user@businesshub.com',
      password: userPassword,
      name: 'Business User',
      role: 'User',
      status: 'Active',
      color: '#3B82F6'
    }
  })

  console.log('Database seeded successfully!')
  console.log('Created roles:', { adminRole, managerRole, userRole })
  console.log('Created users:', { 
    adminUser: { 
      email: adminUser.email, 
      name: adminUser.name, 
      role: adminUser.role,
      password: '***' // Don't log actual passwords
    },
    managerUser: { 
      email: managerUser.email, 
      name: managerUser.name, 
      role: managerUser.role,
      password: '***'
    },
    businessUser: { 
      email: businessUser.email, 
      name: businessUser.name, 
      role: businessUser.role,
      password: '***'
    }
  })
  console.log('Demo credentials:')
  console.log('- Admin: admin@businesshub.com / admin123')
  console.log('- Manager: manager@businesshub.com / manager123') 
  console.log('- User: user@businesshub.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })