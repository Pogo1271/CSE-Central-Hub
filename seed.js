const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default roles with comprehensive permissions including page access
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'Full system access',
      color: 'bg-red-100 text-red-800',
      permissions: {
        // Dashboard permissions
        canViewDashboard: true,
        // Dashboard Quick Actions permissions
        canQuickAddBusiness: true,
        canQuickCreateUser: true,
        canQuickUploadDocument: true,
        canQuickSendMessage: true,
        // Business permissions
        canCreateBusiness: true,
        canEditBusiness: true,
        canDeleteBusiness: true,
        // User permissions
        canCreateUser: true,
        canEditUser: true,
        canDeleteUser: true,
        canManageRoles: true,
        canViewUsers: true,
        // Product permissions
        canCreateProduct: true,
        canEditProduct: true,
        canDeleteProduct: true,
        // Task permissions
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: true,
        canAssignTasks: true,
        // Quote permissions
        canCreateQuote: true,
        canEditQuote: true,
        canDeleteQuote: true,
        canApproveQuotes: true,
        // Document permissions
        canUploadDocument: true,
        canDeleteDocument: true,
        // Message permissions
        canSendMessage: true,
        canDeleteMessage: true,
        // Analytics permissions
        canViewAnalytics: true,
        canExportData: true,
        // System permissions
        canAccessSettings: true,
        canViewSystemLogs: true,
        canManageNotifications: true,
        // Page access permissions (controls sidebar visibility and data access)
        canViewDashboardPage: true,
        canViewBusinessesPage: true,
        canViewInventoryPage: true,
        canViewTasksPage: true,
        canViewUsersPage: true,
        canViewQuotesPage: true,
        canViewDocumentsPage: true,
        canViewMessagesPage: true,
        canViewAnalyticsPage: true,
        canViewSettingsPage: true
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
        // Dashboard permissions
        canViewDashboard: true,
        // Dashboard Quick Actions permissions
        canQuickAddBusiness: true,
        canQuickCreateUser: false,
        canQuickUploadDocument: true,
        canQuickSendMessage: true,
        // Business permissions
        canCreateBusiness: true,
        canEditBusiness: true,
        canDeleteBusiness: false,
        // User permissions
        canCreateUser: false,
        canEditUser: true,
        canDeleteUser: false,
        canManageRoles: false,
        canViewUsers: true,
        // Product permissions
        canCreateProduct: true,
        canEditProduct: true,
        canDeleteProduct: false,
        // Task permissions
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: false,
        canAssignTasks: true,
        // Quote permissions
        canCreateQuote: true,
        canEditQuote: true,
        canDeleteQuote: false,
        canApproveQuotes: true,
        // Document permissions
        canUploadDocument: true,
        canDeleteDocument: false,
        // Message permissions
        canSendMessage: true,
        canDeleteMessage: false,
        // Analytics permissions
        canViewAnalytics: false,
        canExportData: false,
        // System permissions
        canAccessSettings: false,
        canViewSystemLogs: false,
        canManageNotifications: true,
        // Page access permissions (controls sidebar visibility and data access)
        canViewDashboardPage: true,
        canViewBusinessesPage: true,
        canViewInventoryPage: true,
        canViewTasksPage: true,
        canViewUsersPage: true,
        canViewQuotesPage: true,
        canViewDocumentsPage: true,
        canViewMessagesPage: true,
        canViewAnalyticsPage: false,
        canViewSettingsPage: false
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
        // Dashboard permissions
        canViewDashboard: true,
        // Dashboard Quick Actions permissions
        canQuickAddBusiness: false,
        canQuickCreateUser: false,
        canQuickUploadDocument: false,
        canQuickSendMessage: false,
        // Business permissions
        canCreateBusiness: false,
        canEditBusiness: false,
        canDeleteBusiness: false,
        // User permissions
        canCreateUser: false,
        canEditUser: false,
        canDeleteUser: false,
        canManageRoles: false,
        canViewUsers: false,
        // Product permissions
        canCreateProduct: false,
        canEditProduct: false,
        canDeleteProduct: false,
        // Task permissions
        canCreateTask: true,
        canEditTask: false,
        canDeleteTask: false,
        canAssignTasks: false,
        // Quote permissions
        canCreateQuote: false,
        canEditQuote: false,
        canDeleteQuote: false,
        canApproveQuotes: false,
        // Document permissions
        canUploadDocument: false,
        canDeleteDocument: false,
        // Message permissions
        canSendMessage: false,
        canDeleteMessage: false,
        // Analytics permissions
        canViewAnalytics: false,
        canExportData: false,
        // System permissions
        canAccessSettings: false,
        canViewSystemLogs: false,
        canManageNotifications: false,
        // Page access permissions (controls sidebar visibility and data access)
        canViewDashboardPage: true,
        canViewBusinessesPage: false,
        canViewInventoryPage: false,
        canViewTasksPage: true,
        canViewUsersPage: false,
        canViewQuotesPage: false,
        canViewDocumentsPage: false,
        canViewMessagesPage: false,
        canViewAnalyticsPage: false,
        canViewSettingsPage: false
      }
    }
  })

  // Create SuperUser role with all permissions
  const superUserRole = await prisma.role.upsert({
    where: { name: 'SuperUser' },
    update: {},
    create: {
      name: 'SuperUser',
      description: 'Ultimate system access with emergency controls',
      color: '#8B5CF6',
      permissions: {
        // Dashboard permissions
        canViewDashboard: true,
        // Dashboard Quick Actions permissions
        canQuickAddBusiness: true,
        canQuickCreateUser: true,
        canQuickUploadDocument: true,
        canQuickSendMessage: true,
        // Business permissions
        canCreateBusiness: true,
        canEditBusiness: true,
        canDeleteBusiness: true,
        // User permissions
        canCreateUser: true,
        canEditUser: true,
        canDeleteUser: true,
        canManageRoles: true,
        canViewUsers: true,
        // Product permissions
        canCreateProduct: true,
        canEditProduct: true,
        canDeleteProduct: true,
        // Task permissions
        canCreateTask: true,
        canEditTask: true,
        canDeleteTask: true,
        canAssignTasks: true,
        // Quote permissions
        canCreateQuote: true,
        canEditQuote: true,
        canDeleteQuote: true,
        canApproveQuotes: true,
        // Document permissions
        canUploadDocument: true,
        canDeleteDocument: true,
        // Message permissions
        canSendMessage: true,
        canDeleteMessage: true,
        // Analytics permissions
        canViewAnalytics: true,
        canExportData: true,
        // System permissions
        canAccessSettings: true,
        canViewSystemLogs: true,
        canManageNotifications: true,
        canClearActivityLogs: true,
        // Page access permissions (controls sidebar visibility and data access)
        canViewDashboardPage: true,
        canViewBusinessesPage: true,
        canViewInventoryPage: true,
        canViewTasksPage: true,
        canViewUsersPage: true,
        canViewQuotesPage: true,
        canViewDocumentsPage: true,
        canViewMessagesPage: true,
        canViewAnalyticsPage: true,
        canViewActivityLogsPage: true,
        canViewEmergencyControlPage: true,
        canViewSettingsPage: true
      }
    }
  })

  // Create demo users with proper passwords
  const adminPassword = await bcrypt.hash('admin123', 10)
  const managerPassword = await bcrypt.hash('manager123', 10)
  const userPassword = await bcrypt.hash('user123', 10)
  const superUserPassword = await bcrypt.hash('superuser123', 10)

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

  const superUser = await prisma.user.upsert({
    where: { email: 'superuser@businesshub.com' },
    update: { password: superUserPassword },
    create: {
      email: 'superuser@businesshub.com',
      password: superUserPassword,
      name: 'Super User',
      role: 'SuperUser',
      status: 'Active',
      color: '#8B5CF6'
    }
  })

  console.log('Database seeded successfully!')
  console.log('Created roles:', { adminRole, managerRole, userRole, superUserRole })
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
    },
    superUser: { 
      email: superUser.email, 
      name: superUser.name, 
      role: superUser.role,
      password: '***'
    }
  })
  console.log('Demo credentials:')
  console.log('- Admin: admin@businesshub.com / admin123')
  console.log('- Manager: manager@businesshub.com / manager123') 
  console.log('- User: user@businesshub.com / user123')
  console.log('- SuperUser: superuser@businesshub.com / superuser123')
  console.log('')
  console.log('Role Permissions Summary:')
  console.log('- Admin: Full access to all pages and features')
  console.log('- Manager: Access to Dashboard, Businesses, Inventory, Tasks, Users, Quotes, Documents, Messages')
  console.log('- User: Access to Dashboard and Tasks only')
  console.log('- SuperUser: Ultimate system access with emergency controls and activity logs management')
  console.log('')
  console.log('Sidebar Navigation Fix:')
  console.log('- Page access permissions (canView*Page) now control sidebar visibility')
  console.log('- Admin users will see all navigation items')
  console.log('- Manager users will see relevant navigation items based on permissions')
  console.log('- User users will see only Dashboard and Tasks navigation items')
  console.log('- SuperUser users will see all navigation items including emergency controls')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })