import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Delete existing roles to start fresh
  await prisma.role.deleteMany({})
  console.log('Deleted existing roles')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@businesshub.com' },
    update: {},
    create: {
      email: 'admin@businesshub.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'Admin',
      status: 'Active',
      color: '#EF4444',
    },
  })

  // Create manager user
  const managerHashedPassword = await bcrypt.hash('manager123', 10)
  
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@businesshub.com' },
    update: {},
    create: {
      email: 'manager@businesshub.com',
      password: managerHashedPassword,
      name: 'Manager User',
      role: 'Manager',
      status: 'Active',
      color: '#F59E0B',
    },
  })

  // Create regular user
  const userHashedPassword = await bcrypt.hash('user123', 10)
  
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@businesshub.com' },
    update: {},
    create: {
      email: 'user@businesshub.com',
      password: userHashedPassword,
      name: 'Regular User',
      role: 'User',
      status: 'Active',
      color: '#3B82F6',
    },
  })

  // Create default roles
  const adminRole = await prisma.role.create({
    data: {
      name: 'Admin',
      description: 'Full system access',
      color: '#EF4444',
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
    },
  })

  const managerRole = await prisma.role.create({
    data: {
      name: 'Manager',
      description: 'Limited admin access',
      color: '#F59E0B',
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
    },
  })

  const userRole = await prisma.role.create({
    data: {
      name: 'User',
      description: 'Basic user access',
      color: '#3B82F6',
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
    },
  })

  // Create sample businesses
  /*
  const techBusiness = await prisma.business.create({
    data: {
      name: 'Tech Solutions Inc.',
      description: 'Leading provider of innovative tech solutions for businesses of all sizes.',
      category: 'Technology',
      location: 'San Francisco, CA',
      phone: '+1 (555) 123-4567',
      email: 'info@techsolutions.com',
      website: 'www.techsolutions.com',
      status: 'Active',
      userId: adminUser.id,
    },
  })

  const marketingBusiness = await prisma.business.create({
    data: {
      name: 'Marketing Pro',
      description: 'Full-service digital marketing agency helping businesses grow their online presence.',
      category: 'Marketing',
      location: 'New York, NY',
      phone: '+1 (555) 234-5678',
      email: 'hello@marketingpro.com',
      website: 'www.marketingpro.com',
      status: 'Active',
      userId: adminUser.id,
    },
  })

  // Create sample products
  const eposPro = await prisma.product.create({
    data: {
      name: 'EPOS System Pro',
      description: 'Complete EPOS system with inventory management',
      price: 2999.99,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'EPOS-PRO-001',
    },
  })

  const supportPackage = await prisma.product.create({
    data: {
      name: 'Support Package',
      description: 'Technical support and maintenance services',
      price: 299.99,
      pricingType: 'monthly',
      category: 'Services',
      sku: 'SUPPORT-001',
    },
  })

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      title: 'System Upgrade',
      description: 'Upgrade to latest software version',
      startDate: new Date(),
      status: 'in-progress',
      priority: 'high',
      businessId: techBusiness.id,
      assigneeId: adminUser.id,
      createdById: adminUser.id,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Security Audit',
      description: 'Annual security assessment',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending',
      priority: 'medium',
      businessId: techBusiness.id,
      assigneeId: adminUser.id,
      createdById: adminUser.id,
    },
  })

  // Create sample quotes
  const quote1 = await prisma.quote.create({
    data: {
      title: 'EPOS System Quote',
      description: 'Complete EPOS solution for Tech Solutions Inc.',
      businessId: techBusiness.id,
      userId: adminUser.id,
      status: 'sent',
      totalAmount: 2999.99,
    },
  })

  // Create sample quote items
  await prisma.quoteItem.create({
    data: {
      quoteId: quote1.id,
      productId: eposPro.id,
      quantity: 1,
      price: 2999.99,
    },
  })

  // Create sample documents
  await prisma.document.create({
    data: {
      name: 'Business Plan 2024',
      type: 'PDF',
      size: '2.5 MB',
      path: '/documents/business-plan-2024.pdf',
      category: 'Planning',
      uploadedBy: 'Admin User',
    },
  })

  await prisma.document.create({
    data: {
      name: 'Marketing Strategy',
      type: 'DOCX',
      size: '1.2 MB',
      path: '/documents/marketing-strategy.docx',
      category: 'Marketing',
      uploadedBy: 'Admin User',
    },
  })
  */

  console.log('Database seeded successfully!')
  console.log('Default users:')
  console.log('Admin:', {
    email: 'admin@businesshub.com',
    password: 'admin123',
    role: 'Admin'
  })
  console.log('Manager:', {
    email: 'manager@businesshub.com',
    password: 'manager123',
    role: 'Manager'
  })
  console.log('User:', {
    email: 'user@businesshub.com',
    password: 'user123',
    role: 'User'
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })