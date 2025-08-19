import { db } from '@/lib/db'

// Business API functions
export async function getBusinesses() {
  try {
    const businesses = await db.business.findMany({
      include: {
        contacts: true,
        tasks: true,
        notes: true,
        products: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data: businesses }
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return { success: false, error: 'Failed to fetch businesses' }
  }
}

export async function getBusinessById(id: string) {
  try {
    const business = await db.business.findUnique({
      where: { id },
      include: {
        contacts: true,
        tasks: {
          include: {
            assignee: true,
            business: true
          }
        },
        notes: true,
        products: {
          include: {
            product: true
          }
        },
        user: true
      }
    })
    return { success: true, data: business }
  } catch (error) {
    console.error('Error fetching business:', error)
    return { success: false, error: 'Failed to fetch business' }
  }
}

export async function createBusiness(data: any) {
  try {
    const business = await db.business.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        location: data.location,
        phone: data.phone,
        email: data.email,
        website: data.website,
        status: data.status || 'Active',
        supportContract: data.supportContract || false,
        supportExpiry: data.supportExpiry,
        userId: data.userId
      },
      include: {
        contacts: true,
        tasks: true,
        notes: true,
        products: true,
        user: true
      }
    })
    return { success: true, data: business }
  } catch (error) {
    console.error('Error creating business:', error)
    return { success: false, error: 'Failed to create business' }
  }
}

export async function updateBusiness(id: string, data: any) {
  try {
    const business = await db.business.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        location: data.location,
        phone: data.phone,
        email: data.email,
        website: data.website,
        status: data.status,
        supportContract: data.supportContract,
        supportExpiry: data.supportExpiry,
        userId: data.userId
      },
      include: {
        contacts: true,
        tasks: true,
        notes: true,
        products: true,
        user: true
      }
    })
    return { success: true, data: business }
  } catch (error) {
    console.error('Error updating business:', error)
    return { success: false, error: 'Failed to update business' }
  }
}

export async function deleteBusiness(id: string) {
  try {
    await db.business.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting business:', error)
    return { success: false, error: 'Failed to delete business' }
  }
}

// User API functions
export async function getUsers() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data: users }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}

export async function getUserById(id: string) {
  try {
    const user = await db.user.findUnique({
      where: { id }
    })
    return { success: true, data: user }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { success: false, error: 'Failed to fetch user' }
  }
}

export async function createUser(data: any) {
  try {
    const user = await db.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        status: data.status || 'Active',
        color: data.color
      }
    })
    return { success: true, data: user }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const user = await db.user.update({
      where: { id },
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        status: data.status,
        color: data.color
      }
    })
    return { success: true, data: user }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

export async function deleteUser(id: string) {
  try {
    await db.user.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

// Task API functions
export async function getTasks() {
  try {
    const tasks = await db.task.findMany({
      include: {
        assignee: true,
        business: true,
        createdBy: true,
        parentTask: true,
        instances: true
      },
      orderBy: {
        startDate: 'asc'
      }
    })
    return { success: true, data: tasks }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

export async function getTaskById(id: string) {
  try {
    const task = await db.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        business: true,
        createdBy: true,
        parentTask: true,
        instances: true
      }
    })
    return { success: true, data: task }
  } catch (error) {
    console.error('Error fetching task:', error)
    return { success: false, error: 'Failed to fetch task' }
  }
}

export async function createTask(data: any) {
  try {
    const task = await db.task.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        allDay: data.allDay || false,
        recurring: data.recurring || false,
        recurringPattern: data.recurringPattern,
        recurrenceEndDate: data.recurrenceEndDate,
        parentTaskId: data.parentTaskId,
        businessId: data.businessId,
        assigneeId: data.assigneeId,
        createdById: data.createdById,
        status: data.status || 'pending',
        priority: data.priority || 'medium'
      },
      include: {
        assignee: true,
        business: true,
        createdBy: true,
        parentTask: true,
        instances: true
      }
    })
    return { success: true, data: task }
  } catch (error) {
    console.error('Error creating task:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

export async function updateTask(id: string, data: any) {
  try {
    const task = await db.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        allDay: data.allDay,
        recurring: data.recurring,
        recurringPattern: data.recurringPattern,
        recurrenceEndDate: data.recurrenceEndDate,
        parentTaskId: data.parentTaskId,
        businessId: data.businessId,
        assigneeId: data.assigneeId,
        createdById: data.createdById,
        status: data.status,
        priority: data.priority
      },
      include: {
        assignee: true,
        business: true,
        createdBy: true,
        parentTask: true,
        instances: true
      }
    })
    return { success: true, data: task }
  } catch (error) {
    console.error('Error updating task:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

export async function deleteTask(id: string) {
  try {
    await db.task.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting task:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}

// Product API functions
export async function getProducts() {
  try {
    const products = await db.product.findMany({
      include: {
        businessProducts: {
          include: {
            business: true
          }
        },
        quoteItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data: products }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { success: false, error: 'Failed to fetch products' }
  }
}

export async function getProductById(id: string) {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        businessProducts: {
          include: {
            business: true
          }
        },
        quoteItems: true
      }
    })
    return { success: true, data: product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: 'Failed to fetch product' }
  }
}

export async function createProduct(data: any) {
  try {
    const product = await db.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        pricingType: data.pricingType || 'one-off',
        category: data.category,
        sku: data.sku,
        stock: parseInt(data.stock) || 0,
        lowStockThreshold: parseInt(data.lowStockThreshold) || 10
      },
      include: {
        businessProducts: {
          include: {
            business: true
          }
        },
        quoteItems: true
      }
    })
    return { success: true, data: product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(id: string, data: any) {
  try {
    const product = await db.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        pricingType: data.pricingType,
        category: data.category,
        sku: data.sku,
        stock: parseInt(data.stock),
        lowStockThreshold: parseInt(data.lowStockThreshold)
      },
      include: {
        businessProducts: {
          include: {
            business: true
          }
        },
        quoteItems: true
      }
    })
    return { success: true, data: product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.product.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}

// Contact API functions
export async function createContact(data: any) {
  try {
    const contact = await db.contact.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position,
        businessId: data.businessId
      }
    })
    return { success: true, data: contact }
  } catch (error) {
    console.error('Error creating contact:', error)
    return { success: false, error: 'Failed to create contact' }
  }
}

export async function updateContact(id: string, data: any) {
  try {
    const contact = await db.contact.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: data.position
      }
    })
    return { success: true, data: contact }
  } catch (error) {
    console.error('Error updating contact:', error)
    return { success: false, error: 'Failed to update contact' }
  }
}

export async function deleteContact(id: string) {
  try {
    await db.contact.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting contact:', error)
    return { success: false, error: 'Failed to delete contact' }
  }
}

// Note API functions
export async function createNote(data: any) {
  try {
    const note = await db.note.create({
      data: {
        title: data.title,
        content: data.content,
        businessId: data.businessId
      }
    })
    return { success: true, data: note }
  } catch (error) {
    console.error('Error creating note:', error)
    return { success: false, error: 'Failed to create note' }
  }
}

export async function updateNote(id: string, data: any) {
  try {
    const note = await db.note.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content
      }
    })
    return { success: true, data: note }
  } catch (error) {
    console.error('Error updating note:', error)
    return { success: false, error: 'Failed to update note' }
  }
}

export async function deleteNote(id: string) {
  try {
    await db.note.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting note:', error)
    return { success: false, error: 'Failed to delete note' }
  }
}

// Business Product API functions
export async function createBusinessProduct(data: any) {
  try {
    const businessProduct = await db.businessProduct.create({
      data: {
        businessId: data.businessId,
        productId: data.productId
      },
      include: {
        business: true,
        product: true
      }
    })
    return { success: true, data: businessProduct }
  } catch (error) {
    console.error('Error creating business product:', error)
    return { success: false, error: 'Failed to create business product' }
  }
}

export async function deleteBusinessProduct(businessId: string, productId: string) {
  try {
    await db.businessProduct.delete({
      where: {
        businessId_productId: {
          businessId,
          productId
        }
      }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting business product:', error)
    return { success: false, error: 'Failed to delete business product' }
  }
}

// Role API functions
export async function getRoles() {
  try {
    const roles = await db.role.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data: roles }
  } catch (error) {
    console.error('Error fetching roles:', error)
    return { success: false, error: 'Failed to fetch roles' }
  }
}

export async function createRole(data: any) {
  try {
    const role = await db.role.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        permissions: data.permissions
      }
    })
    return { success: true, data: role }
  } catch (error) {
    console.error('Error creating role:', error)
    return { success: false, error: 'Failed to create role' }
  }
}

export async function updateRole(id: string, data: any) {
  try {
    const role = await db.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        permissions: data.permissions
      }
    })
    return { success: true, data: role }
  } catch (error) {
    console.error('Error updating role:', error)
    return { success: false, error: 'Failed to update role' }
  }
}

export async function deleteRole(id: string) {
  try {
    await db.role.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting role:', error)
    return { success: false, error: 'Failed to delete role' }
  }
}

// Quote API functions
export async function getQuotes() {
  try {
    const quotes = await db.quote.findMany({
      include: {
        business: true,
        items: {
          include: {
            product: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data: quotes }
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return { success: false, error: 'Failed to fetch quotes' }
  }
}

export async function getQuoteById(id: string) {
  try {
    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        business: true,
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    })
    return { success: true, data: quote }
  } catch (error) {
    console.error('Error fetching quote:', error)
    return { success: false, error: 'Failed to fetch quote' }
  }
}

export async function createQuote(data: any) {
  try {
    const quote = await db.quote.create({
      data: {
        title: data.title,
        description: data.description,
        businessId: data.businessId,
        userId: data.userId,
        status: data.status || 'draft',
        totalAmount: data.totalAmount || 0,
        items: data.items ? {
          create: data.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        } : undefined
      },
      include: {
        business: true,
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    })
    return { success: true, data: quote }
  } catch (error) {
    console.error('Error creating quote:', error)
    return { success: false, error: 'Failed to create quote' }
  }
}

export async function updateQuote(id: string, data: any) {
  try {
    const quote = await db.quote.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        businessId: data.businessId,
        userId: data.userId,
        status: data.status,
        totalAmount: data.totalAmount
      },
      include: {
        business: true,
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    })
    return { success: true, data: quote }
  } catch (error) {
    console.error('Error updating quote:', error)
    return { success: false, error: 'Failed to update quote' }
  }
}

export async function deleteQuote(id: string) {
  try {
    await db.quote.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting quote:', error)
    return { success: false, error: 'Failed to delete quote' }
  }
}

// Dashboard API functions
export async function getDashboardStats() {
  try {
    const [businessCount, productCount, taskCount, userCount] = await Promise.all([
      db.business.count(),
      db.product.count(),
      db.task.count(),
      db.user.count()
    ])

    const stats = {
      totalBusinesses: businessCount,
      activeProducts: productCount,
      activeTasks: taskCount,
      totalUsers: userCount
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { success: false, error: 'Failed to fetch dashboard stats' }
  }
}