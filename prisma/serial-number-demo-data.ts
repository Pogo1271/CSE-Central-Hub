import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedSerialNumberDemoData() {
  console.log('Seeding serial number demo data...')

  // Create serialized hardware products (based on the quote document)
  const cseA2Pro = await prisma.product.create({
    data: {
      name: 'CSE-A2 Pro Wide Screen',
      description: 'Professional wide screen EPOS system with advanced features',
      price: 1295.00,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'CSE-A2-PRO-001',
      isSerialized: true,
      stock: 5,
      lowStockThreshold: 2,
    },
  })

  const cashDrawer = await prisma.product.create({
    data: {
      name: 'Cash Drawer',
      description: 'Heavy-duty cash drawer for retail environments',
      price: 90.00,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'CD-001',
      isSerialized: true,
      stock: 8,
      lowStockThreshold: 3,
    },
  })

  const xprinter = await prisma.product.create({
    data: {
      name: 'Xprinter R330H Thermal Printer',
      description: 'High-speed thermal receipt printer',
      price: 250.00,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'XP-R330H-001',
      isSerialized: true,
      stock: 6,
      lowStockThreshold: 2,
    },
  })

  const orbitScanner = await prisma.product.create({
    data: {
      name: 'Multi Line Orbit Scanner',
      description: 'Multi-line barcode scanner for retail',
      price: 250.00,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'OS-ML-001',
      isSerialized: true,
      stock: 4,
      lowStockThreshold: 1,
    },
  })

  // Create product instances (serial numbers)
  const serialNumbers = [
    // CSE-A2 Pro Wide Screen serials
    { serialNumber: 'CSE-A2-001', productId: cseA2Pro.id, status: 'in-stock', comments: 'New stock - JD' },
    { serialNumber: 'CSE-A2-002', productId: cseA2Pro.id, status: 'sold', businessId: 'tech-solutions-id', comments: 'Sold to Tech Solutions - JD' },
    { serialNumber: 'CSE-A2-003', productId: cseA2Pro.id, status: 'on-car', businessId: 'cornwall-scales-id', comments: 'Installation in progress - SM' },
    { serialNumber: 'CSE-A2-004', productId: cseA2Pro.id, status: 'office-use', comments: 'Demo unit - JD' },
    { serialNumber: 'CSE-A2-005', productId: cseA2Pro.id, status: 'in-stock', comments: 'New stock - JD' },
    
    // Cash Drawer serials
    { serialNumber: 'CD-001', productId: cashDrawer.id, status: 'in-stock', comments: 'New stock - SM' },
    { serialNumber: 'CD-002', productId: cashDrawer.id, status: 'sold', businessId: 'retail-store-id', comments: 'Sold to Retail Store Plus - SM' },
    { serialNumber: 'CD-003', productId: cashDrawer.id, status: 'in-stock', comments: 'New stock - SM' },
    { serialNumber: 'CD-004', productId: cashDrawer.id, status: 'swapped', businessId: 'cornwall-scales-id', comments: 'Replaced faulty unit - JD' },
    { serialNumber: 'CD-005', productId: cashDrawer.id, status: 'in-stock', comments: 'New stock - SM' },
    { serialNumber: 'CD-006', productId: cashDrawer.id, status: 'office-use', comments: 'Testing unit - JD' },
    { serialNumber: 'CD-007', productId: cashDrawer.id, status: 'in-stock', comments: 'New stock - SM' },
    { serialNumber: 'CD-008', productId: cashDrawer.id, status: 'returned', businessId: 'tech-solutions-id', comments: 'Customer return - JD' },
    
    // Xprinter serials
    { serialNumber: 'XP-R330H-001', productId: xprinter.id, status: 'in-stock', comments: 'New stock - JD' },
    { serialNumber: 'XP-R330H-002', productId: xprinter.id, status: 'sold', businessId: 'cornwall-scales-id', comments: 'Sold to Cornwall Scales - SM' },
    { serialNumber: 'XP-R330H-003', productId: xprinter.id, status: 'in-stock', comments: 'New stock - JD' },
    { serialNumber: 'XP-R330H-004', productId: xprinter.id, status: 'on-car', businessId: 'restaurant-biz-id', comments: 'Installation scheduled - JD' },
    { serialNumber: 'XP-R330H-005', productId: xprinter.id, status: 'in-stock', comments: 'New stock - JD' },
    { serialNumber: 'XP-R330H-006', productId: xprinter.id, status: 'office-use', comments: 'Demo unit - SM' },
    
    // Orbit Scanner serials
    { serialNumber: 'OS-ML-001', productId: orbitScanner.id, status: 'in-stock', comments: 'New stock - JD' },
    { serialNumber: 'OS-ML-002', productId: orbitScanner.id, status: 'sold', businessId: 'marketing-pro-id', comments: 'Sold to Marketing Pro - SM' },
    { serialNumber: 'OS-ML-003', productId: orbitScanner.id, status: 'in-stock', comments: 'New stock - JD' },
    { serialNumber: 'OS-ML-004', productId: orbitScanner.id, status: 'swapped', businessId: 'tech-solutions-id', comments: 'Warranty replacement - JD' },
  ]

  // Get actual business IDs from the database
  const businesses = await prisma.business.findMany({
    select: { id: true, name: true }
  })

  const businessMap = businesses.reduce((acc, business) => {
    acc[business.name.toLowerCase().replace(/\s+/g, '-')] = business.id
    return acc
  }, {} as Record<string, string>)

  // Create product instances with correct business IDs
  for (const serialData of serialNumbers) {
    const businessId = serialData.businessId ? businessMap[serialData.businessId] || null : null
    
    await prisma.productInstance.create({
      data: {
        serialNumber: serialData.serialNumber,
        productId: serialData.productId,
        status: serialData.status,
        businessId: businessId,
        comments: serialData.comments,
        soldDate: serialData.status === 'sold' ? new Date() : null,
        warrantyExpiry: serialData.status === 'sold' ? 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null, // 1 year warranty
      }
    })
  }

  console.log('Serial number demo data seeded successfully!')
  console.log('Serialized products created:')
  console.log('- CSE-A2 Pro Wide Screen (5 units)')
  console.log('- Cash Drawer (8 units)')
  console.log('- Xprinter R330H Thermal Printer (6 units)')
  console.log('- Multi Line Orbit Scanner (4 units)')
  console.log('')
  console.log('Total serial numbers created:', serialNumbers.length)
  console.log('Status distribution:')
  console.log('- In Stock:', serialNumbers.filter(s => s.status === 'in-stock').length)
  console.log('- Sold:', serialNumbers.filter(s => s.status === 'sold').length)
  console.log('- On Car:', serialNumbers.filter(s => s.status === 'on-car').length)
  console.log('- Office Use:', serialNumbers.filter(s => s.status === 'office-use').length)
  console.log('- Swapped:', serialNumbers.filter(s => s.status === 'swapped').length)
  console.log('- Returned:', serialNumbers.filter(s => s.status === 'returned').length)
}

// Export for direct execution
if (require.main === module) {
  seedSerialNumberDemoData()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}