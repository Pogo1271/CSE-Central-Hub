import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating large quote for testing...')

  // Get a business
  const business = await prisma.business.findFirst()
  if (!business) {
    console.log('No business found')
    return
  }

  // Get products
  const products = await prisma.product.findMany()
  if (products.length === 0) {
    console.log('No products found')
    return
  }

  console.log(`Found business: ${business.name}`)
  console.log(`Found ${products.length} products`)

  // Create a large quote with many items
  const quoteItems = []
  let totalAmount = 0
  
  // Add multiple instances of each product to create a large quote
  for (let i = 0; i < 20; i++) { // Create 20 items per product
    for (const product of products) {
      const quantity = Math.floor(Math.random() * 5) + 1 // Random quantity 1-5
      const price = product.price
      const itemTotal = price * quantity
      totalAmount += itemTotal
      
      quoteItems.push({
        productId: product.id,
        quantity,
        price
      })
    }
  }

  console.log(`Creating quote with ${quoteItems.length} items`)
  console.log(`Total amount: ${totalAmount}`)

  // Create the quote
  const quote = await prisma.quote.create({
    data: {
      title: 'Large Test Quote for Performance Testing',
      description: 'This is a large quote created to test PDF generation performance with many items.',
      businessId: business.id,
      status: 'draft',
      totalAmount,
      items: {
        create: quoteItems
      }
    },
    include: {
      business: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  console.log('Large quote created successfully!')
  console.log(`Quote ID: ${quote.id}`)
  console.log(`Number of items: ${quote.items.length}`)
  console.log(`Total amount: ${quote.totalAmount}`)

  // Return the quote ID for testing
  console.log(`\nTest this quote by visiting: http://localhost:3000/api/quotes/${quote.id}/pdf`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })