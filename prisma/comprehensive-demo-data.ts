import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function seedComprehensiveDemoData() {
  console.log('Seeding comprehensive demo data...')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'Admin',
      status: 'Active',
      color: '#EF4444',
    },
  })

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

  // Create sample businesses from the screenshot
  const cornwallScales = await prisma.business.create({
    data: {
      name: 'Cornwall Scales',
      description: 'Precision weighing solutions for industrial and commercial applications',
      category: 'Technology',
      location: 'Cornwall, UK',
      phone: '+44 1234 567890',
      email: 'info@cornwallscales.co.uk',
      website: 'www.cornwallscales.co.uk',
      status: 'Active',
      supportContract: true,
      userId: adminUser.id,
    },
  })

  const marketingPro = await prisma.business.create({
    data: {
      name: 'Marketing Pro',
      description: 'Full-service digital marketing agency helping businesses grow their online presence',
      category: 'Marketing',
      location: 'New York, NY',
      phone: '+1 (555) 234-5678',
      email: 'hello@marketingpro.com',
      website: 'www.marketingpro.com',
      status: 'Active',
      supportContract: false,
      userId: adminUser.id,
    },
  })

  const techSolutions = await prisma.business.create({
    data: {
      name: 'Tech Solutions Inc.',
      description: 'Leading provider of innovative tech solutions for businesses of all sizes',
      category: 'Technology',
      location: 'San Francisco, CA',
      phone: '+1 (555) 123-4567',
      email: 'info@techsolutions.com',
      website: 'www.techsolutions.com',
      status: 'Active',
      supportContract: false,
      userId: adminUser.id,
    },
  })

  // Create additional sample businesses
  const retailStore = await prisma.business.create({
    data: {
      name: 'Retail Store Plus',
      description: 'Modern retail solutions and point-of-sale systems',
      category: 'Retail',
      location: 'Los Angeles, CA',
      phone: '+1 (555) 345-6789',
      email: 'contact@retailstoreplus.com',
      website: 'www.retailstoreplus.com',
      status: 'Active',
      supportContract: true,
      userId: adminUser.id,
    },
  })

  const restaurantBiz = await prisma.business.create({
    data: {
      name: 'Restaurant Biz',
      description: 'Restaurant management and hospitality solutions',
      category: 'Restaurant',
      location: 'Chicago, IL',
      phone: '+1 (555) 456-7890',
      email: 'info@restaurantbiz.com',
      website: 'www.restaurantbiz.com',
      status: 'Active',
      supportContract: false,
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

  const inventorySystem = await prisma.product.create({
    data: {
      name: 'Inventory Management System',
      description: 'Advanced inventory tracking and management software',
      price: 1499.99,
      pricingType: 'one-off',
      category: 'Software',
      sku: 'INV-001',
    },
  })

  const websitePackage = await prisma.product.create({
    data: {
      name: 'Website Package',
      description: 'Professional website design and development',
      price: 2499.99,
      pricingType: 'one-off',
      category: 'Services',
      sku: 'WEB-001',
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
      businessId: techSolutions.id,
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
      businessId: techSolutions.id,
      assigneeId: adminUser.id,
      createdById: adminUser.id,
    },
  })

  // Create sample quotes
  const quote1 = await prisma.quote.create({
    data: {
      title: 'EPOS System Quote',
      description: 'Complete EPOS solution for Tech Solutions Inc.',
      businessId: techSolutions.id,
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

  // Create business-product relationships (assign products to businesses)
  await prisma.businessProduct.create({
    data: {
      businessId: cornwallScales.id,
      productId: supportPackage.id,
      assignedAt: new Date(),
      assignedBy: adminUser.id,
    },
  })

  await prisma.businessProduct.create({
    data: {
      businessId: techSolutions.id,
      productId: eposPro.id,
      assignedAt: new Date(),
      assignedBy: adminUser.id,
    },
  })

  console.log('Comprehensive demo data seeded successfully!')
  console.log('Default admin user:', {
    email: 'admin@example.com',
    password: 'admin123',
  })
  console.log('Businesses created:', [
    'Cornwall Scales',
    'Marketing Pro', 
    'Tech Solutions Inc.',
    'Retail Store Plus',
    'Restaurant Biz'
  ])
}

// Export for direct execution
if (require.main === module) {
  seedComprehensiveDemoData()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}