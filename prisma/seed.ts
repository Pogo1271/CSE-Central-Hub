import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Delete existing data to start fresh
  await prisma.role.deleteMany({})
  await prisma.user.deleteMany({})
  console.log('Deleted existing data')

  // Create superuser
  const superuserHashedPassword = await bcrypt.hash('super123', 10)
  
  const superUser = await prisma.user.upsert({
    where: { email: 'superuser@businesshub.com' },
    update: {},
    create: {
      email: 'superuser@businesshub.com',
      password: superuserHashedPassword,
      name: 'Super User',
      role: 'SuperUser',
      status: 'Active',
      color: '#8B5CF6',
    },
  })

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
  const superuserRole = await prisma.role.create({
    data: {
      name: 'SuperUser',
      description: 'Superuser with all permissions',
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
        canViewSettingsPage: true,
        canViewActivityLogsPage: true,
        canViewEmergencyControlPage: true
      }
    },
  })

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

  const retailBusiness = await prisma.business.create({
    data: {
      name: 'Retail Store Co.',
      description: 'Chain of retail stores specializing in consumer electronics.',
      category: 'Retail',
      location: 'Los Angeles, CA',
      phone: '+1 (555) 345-6789',
      email: 'contact@retailstore.com',
      website: 'www.retailstore.com',
      status: 'Active',
      userId: managerUser.id,
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
      stock: 15,
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
      stock: 50,
    },
  })

  const inventorySoftware = await prisma.product.create({
    data: {
      name: 'Inventory Management Software',
      description: 'Advanced inventory tracking and management system',
      price: 1499.99,
      pricingType: 'one-off',
      category: 'Software',
      sku: 'INV-SOFT-001',
      stock: 25,
    },
  })

  const hardwareBundle = await prisma.product.create({
    data: {
      name: 'Hardware Bundle',
      description: 'Complete hardware setup including barcode scanner and receipt printer',
      price: 899.99,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'HW-BUNDLE-001',
      stock: 30,
    },
  })

  const cloudBackup = await prisma.product.create({
    data: {
      name: 'Cloud Backup Service',
      description: 'Automated cloud backup and disaster recovery solution',
      price: 99.99,
      pricingType: 'monthly',
      category: 'Services',
      sku: 'CLOUD-BACKUP-001',
      stock: 100,
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

  const task3 = await prisma.task.create({
    data: {
      title: 'Marketing Campaign Setup',
      description: 'Setup new digital marketing campaign',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'pending',
      priority: 'high',
      businessId: marketingBusiness.id,
      assigneeId: managerUser.id,
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

  const quote2 = await prisma.quote.create({
    data: {
      title: 'Marketing Pro Package',
      description: 'Comprehensive marketing solution for Marketing Pro',
      businessId: marketingBusiness.id,
      userId: managerUser.id,
      status: 'accepted',
      totalAmount: 4499.98,
    },
  })

  const quote3 = await prisma.quote.create({
    data: {
      title: 'Retail Store Solution',
      description: 'Complete retail management system for Retail Store Co.',
      businessId: retailBusiness.id,
      userId: adminUser.id,
      status: 'draft',
      totalAmount: 5399.97,
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

  await prisma.quoteItem.create({
    data: {
      quoteId: quote2.id,
      productId: inventorySoftware.id,
      quantity: 1,
      price: 1499.99,
    },
  })

  await prisma.quoteItem.create({
    data: {
      quoteId: quote2.id,
      productId: supportPackage.id,
      quantity: 10,
      price: 299.99,
    },
  })

  await prisma.quoteItem.create({
    data: {
      quoteId: quote3.id,
      productId: eposPro.id,
      quantity: 1,
      price: 2999.99,
    },
  })

  await prisma.quoteItem.create({
    data: {
      quoteId: quote3.id,
      productId: hardwareBundle.id,
      quantity: 2,
      price: 899.99,
    },
  })

  await prisma.quoteItem.create({
    data: {
      quoteId: quote3.id,
      productId: cloudBackup.id,
      quantity: 12,
      price: 99.99,
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

  await prisma.document.create({
    data: {
      name: 'Technical Specifications',
      type: 'PDF',
      size: '3.1 MB',
      path: '/documents/tech-specs.pdf',
      category: 'Technical',
      uploadedBy: 'Manager User',
    },
  })

  await prisma.document.create({
    data: {
      name: 'Quarterly Report Q1 2024',
      type: 'XLSX',
      size: '856 KB',
      path: '/documents/q1-report-2024.xlsx',
      category: 'Reports',
      uploadedBy: 'Admin User',
    },
  })

  // Create sample contacts for businesses
  await prisma.contact.create({
    data: {
      name: 'John Smith',
      email: 'john.smith@techsolutions.com',
      phone: '+1 (555) 123-4567',
      position: 'CTO',
      businessId: techBusiness.id,
    },
  })

  await prisma.contact.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techsolutions.com',
      phone: '+1 (555) 123-4568',
      position: 'CEO',
      businessId: techBusiness.id,
    },
  })

  await prisma.contact.create({
    data: {
      name: 'Mike Wilson',
      email: 'mike.wilson@marketingpro.com',
      phone: '+1 (555) 234-5678',
      position: 'Marketing Director',
      businessId: marketingBusiness.id,
    },
  })

  await prisma.contact.create({
    data: {
      name: 'Lisa Chen',
      email: 'lisa.chen@retailstore.com',
      phone: '+1 (555) 345-6789',
      position: 'Store Manager',
      businessId: retailBusiness.id,
    },
  })

  // Create sample notes for businesses
  await prisma.note.create({
    data: {
      title: 'Initial Meeting Notes',
      content: 'Discussed requirements for EPOS system implementation. Client needs inventory management integration.',
      businessId: techBusiness.id,
    },
  })

  await prisma.note.create({
    data: {
      title: 'Follow-up Required',
      content: 'Client requested additional features for the marketing automation system. Need to provide quote for custom development.',
      businessId: marketingBusiness.id,
    },
  })

  await prisma.note.create({
    data: {
      title: 'Site Visit Scheduled',
      content: 'Site visit scheduled for next week to assess current infrastructure and provide recommendations.',
      businessId: retailBusiness.id,
    },
  })

  console.log('Database seeded successfully!')
  console.log('Default users:')
  console.log('SuperUser:', {
    email: 'superuser@businesshub.com',
    password: 'super123',
    role: 'SuperUser'
  })
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
  console.log('\nDemo data created:')
  console.log('- 3 Businesses with contacts and notes')
  console.log('- 5 Products with inventory')
  console.log('- 3 Tasks with different statuses')
  console.log('- 3 Quotes with multiple items')
  console.log('- 4 Documents')
  console.log('- 4 Business contacts')
  console.log('- 3 Business notes')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })