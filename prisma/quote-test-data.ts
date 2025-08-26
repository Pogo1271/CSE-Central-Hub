import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating quote test data...')

  // Create sample businesses
  const cornwallScales = await prisma.business.create({
    data: {
      name: 'Cornwall Scales',
      description: 'Professional weighing equipment and scales provider',
      category: 'Retail',
      location: 'St Austell, Cornwall',
      phone: '0333 577 0108',
      email: 'info@cornwallscalesltd.co.uk',
      website: 'www.cornwallscalesltd.co.uk',
      status: 'Active',
    },
  })

  const techBusiness = await prisma.business.create({
    data: {
      name: 'Tech Solutions Ltd',
      description: 'Technology solutions provider',
      category: 'Technology',
      location: 'London, UK',
      phone: '+44 20 7123 4567',
      email: 'info@techsolutions.co.uk',
      website: 'www.techsolutions.co.uk',
      status: 'Active',
    },
  })

  // Create hardware products (one-off)
  const cseA2Pro = await prisma.product.create({
    data: {
      name: 'CSE-A2 Pro Wide Screen',
      description: 'Professional wide screen EPOS system',
      price: 1295.00,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'CSE-A2-PRO-001',
      stock: 15,
    },
  })

  const cashDrawer = await prisma.product.create({
    data: {
      name: 'Cash Drawer',
      description: 'Standard cash drawer for EPOS systems',
      price: 90.00,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'CD-STD-001',
      stock: 25,
    },
  })

  const thermalPrinter = await prisma.product.create({
    data: {
      name: 'Xprinter R330H Thermal Printer',
      description: 'High-speed thermal receipt printer',
      price: 250.00,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'XP-R330H-001',
      stock: 20,
    },
  })

  const orbitScanner = await prisma.product.create({
    data: {
      name: 'Multi Line Orbit Scanner',
      description: 'Multi-line barcode scanner',
      price: 250.00,
      pricingType: 'one-off',
      category: 'Hardware',
      sku: 'OS-ML-001',
      stock: 18,
    },
  })

  // Create software products (monthly)
  const supportPackage = await prisma.product.create({
    data: {
      name: 'Technical Support Package',
      description: '24/7 technical support and maintenance',
      price: 495.00,
      pricingType: 'monthly',
      category: 'Software',
      sku: 'SUP-247-001',
      stock: 100,
    },
  })

  const softwareLicense = await prisma.product.create({
    data: {
      name: 'EPOS Software License',
      description: 'Complete EPOS software solution',
      price: 299.00,
      pricingType: 'monthly',
      category: 'Software',
      sku: 'EPOS-LIC-001',
      stock: 100,
    },
  })

  const cloudBackup = await prisma.product.create({
    data: {
      name: 'Cloud Backup Service',
      description: 'Automated cloud backup solution',
      price: 99.00,
      pricingType: 'monthly',
      category: 'Software',
      sku: 'CB-001',
      stock: 100,
    },
  })

  const analyticsPackage = await prisma.product.create({
    data: {
      name: 'Analytics & Reporting Package',
      description: 'Advanced analytics and business reporting',
      price: 199.00,
      pricingType: 'monthly',
      category: 'Software',
      sku: 'AN-REP-001',
      stock: 100,
    },
  })

  console.log('Quote test data created successfully!')
  console.log('Businesses:', [cornwallScales.name, techBusiness.name])
  console.log('Hardware products:', [cseA2Pro.name, cashDrawer.name, thermalPrinter.name, orbitScanner.name])
  console.log('Software products:', [supportPackage.name, softwareLicense.name, cloudBackup.name, analyticsPackage.name])
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })