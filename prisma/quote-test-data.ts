import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating test data for quotes...')

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
    },
  }).catch(() => {
    // If business already exists, find it
    return prisma.business.findFirst({
      where: {
        name: 'Tech Solutions Inc.',
        email: 'info@techsolutions.com'
      }
    })
  }).then(business => {
    if (!business) {
      throw new Error('Failed to create or find Tech Solutions Inc.')
    }
    return business
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
    },
  }).catch(() => {
    // If business already exists, find it
    return prisma.business.findFirst({
      where: {
        name: 'Marketing Pro',
        email: 'hello@marketingpro.com'
      }
    })
  }).then(business => {
    if (!business) {
      throw new Error('Failed to create or find Marketing Pro')
    }
    return business
  })

  // Create sample products
  const eposPro = await prisma.product.upsert({
    where: { sku: 'EPOS-PRO-TEST-001' },
    update: {},
    create: {
      name: 'EPOS System Pro',
      description: 'Complete EPOS system with inventory management',
      price: 2999.99,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'EPOS-PRO-TEST-001',
      stock: 10,
    },
  })

  const supportPackage = await prisma.product.upsert({
    where: { sku: 'SUPPORT-TEST-001' },
    update: {},
    create: {
      name: 'Support Package',
      description: 'Technical support and maintenance services',
      price: 299.99,
      pricingType: 'monthly',
      category: 'Services',
      sku: 'SUPPORT-TEST-001',
      stock: 50,
    },
  })

  const printer = await prisma.product.upsert({
    where: { sku: 'PRINTER-TEST-001' },
    update: {},
    create: {
      name: 'Receipt Printer',
      description: 'Thermal receipt printer for POS systems',
      price: 299.99,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'PRINTER-TEST-001',
      stock: 25,
    },
  })

  const softwareLicense = await prisma.product.upsert({
    where: { sku: 'LICENSE-TEST-001' },
    update: {},
    create: {
      name: 'Software License',
      description: 'Annual software license for POS system',
      price: 599.99,
      pricingType: 'monthly',
      category: 'Software',
      sku: 'LICENSE-TEST-001',
      stock: 100,
    },
  })

  // Create sample quotes
  const quote1 = await prisma.quote.create({
    data: {
      title: 'EPOS System Quote',
      description: 'Complete EPOS solution for Tech Solutions Inc.',
      businessId: techBusiness.id,
      status: 'sent',
      totalAmount: 3299.98,
    },
  })

  // Create sample quote items for quote1
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
      quoteId: quote1.id,
      productId: supportPackage.id,
      quantity: 1,
      price: 299.99,
    },
  })

  const quote2 = await prisma.quote.create({
    data: {
      title: 'Marketing Equipment Quote',
      description: 'Hardware and software setup for marketing agency',
      businessId: marketingBusiness.id,
      status: 'draft',
      totalAmount: 3899.97,
    },
  })

  // Create sample quote items for quote2
  await prisma.quoteItem.create({
    data: {
      quoteId: quote2.id,
      productId: eposPro.id,
      quantity: 1,
      price: 2999.99,
    },
  })

  await prisma.quoteItem.create({
    data: {
      quoteId: quote2.id,
      productId: printer.id,
      quantity: 1,
      price: 299.99,
    },
  })

  await prisma.quoteItem.create({
    data: {
      quoteId: quote2.id,
      productId: softwareLicense.id,
      quantity: 1,
      price: 599.99,
    },
  })

  console.log('Test data created successfully!')
  console.log('Businesses:', [techBusiness.name, marketingBusiness.name])
  console.log('Products:', [eposPro.name, supportPackage.name, printer.name, softwareLicense.name])
  console.log('Quotes:', [quote1.title, quote2.title])
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })