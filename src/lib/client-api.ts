// Client-side API service that uses fetch calls to Next.js API routes

// Import JWT utilities for token validation
import { verifyJWTToken, isTokenExpired, refreshToken } from './jwt'

// Helper function to get valid token or refresh if needed
async function getValidToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.warn('No auth token found in localStorage')
      return null
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.warn('Token expired, attempting to refresh...')
      
      // Try to refresh the token
      const newToken = refreshToken(token)
      if (newToken) {
        localStorage.setItem('authToken', newToken)
        console.log('Token refreshed successfully')
        return newToken
      } else {
        console.error('Failed to refresh token')
        // Clear invalid token and redirect to login
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('currentUser')
        localStorage.removeItem('authToken')
        window.location.href = '/auth'
        return null
      }
    }

    return token
  } catch (error) {
    console.error('Error getting valid token:', error)
    return null
  }
}

// Helper function to make authenticated API calls
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getValidToken()
  
  if (!token) {
    throw new Error('No valid authentication token available')
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized errors
  if (response.status === 401) {
    console.warn('Received 401 Unauthorized response, clearing auth state')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    window.location.href = '/auth'
    throw new Error('Session expired. Please log in again.')
  }

  return response
}

// Business API functions
export async function getBusinesses() {
  try {
    const response = await fetch('/api/businesses')
    if (!response.ok) {
      throw new Error('Failed to fetch businesses')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return { success: false, error: 'Failed to fetch businesses' }
  }
}

export async function createBusiness(businessData: any) {
  try {
    const response = await authenticatedFetch('/api/businesses', {
      method: 'POST',
      body: JSON.stringify(businessData),
    })
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating business:', error)
    return { success: false, error: error.message || 'Failed to create business' }
  }
}

export async function updateBusiness(id: string, businessData: any) {
  try {
    const response = await authenticatedFetch(`/api/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(businessData),
    })
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating business:', error)
    return { success: false, error: error.message || 'Failed to update business' }
  }
}

export async function deleteBusiness(id: string) {
  try {
    const response = await authenticatedFetch(`/api/businesses/${id}`, {
      method: 'DELETE',
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting business:', error)
    return { success: false, error: error.message || 'Failed to delete business' }
  }
}

// User API functions
export async function getUsers() {
  try {
    const response = await fetch('/api/users')
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}

export async function createUser(userData: any) {
  try {
    const response = await authenticatedFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: error.message || 'Failed to create user' }
  }
}

export async function updateUser(id: string, userData: any) {
  try {
    // Check if only color is being updated
    const keys = Object.keys(userData)
    const isColorOnly = keys.length === 1 && keys.includes('color')
    
    const response = await authenticatedFetch(`/api/users/${id}`, {
      method: isColorOnly ? 'PATCH' : 'PUT',
      body: JSON.stringify(userData),
    })
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: error.message || 'Failed to update user' }
  }
}

export async function deleteUser(id: string) {
  try {
    const response = await authenticatedFetch(`/api/users/${id}`, {
      method: 'DELETE',
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: error.message || 'Failed to delete user' }
  }
}

// Task API functions
export async function getTasks() {
  try {
    const response = await fetch('/api/tasks')
    if (!response.ok) {
      throw new Error('Failed to fetch tasks')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return { success: false, error: 'Failed to fetch tasks' }
  }
}

export async function createTask(taskData: any) {
  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    })
    if (!response.ok) {
      throw new Error('Failed to create task')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating task:', error)
    return { success: false, error: 'Failed to create task' }
  }
}

export async function updateTask(id: string, taskData: any) {
  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    })
    if (!response.ok) {
      throw new Error('Failed to update task')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating task:', error)
    return { success: false, error: 'Failed to update task' }
  }
}

export async function deleteTask(id: string) {
  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete task')
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting task:', error)
    return { success: false, error: 'Failed to delete task' }
  }
}

// Product API functions
export async function getProducts() {
  try {
    const response = await fetch('/api/products')
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { success: false, error: 'Failed to fetch products' }
  }
}

export async function createProduct(productData: any) {
  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })
    if (!response.ok) {
      throw new Error('Failed to create product')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

export async function updateProduct(id: string, productData: any) {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })
    if (!response.ok) {
      throw new Error('Failed to update product')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(id: string) {
  try {
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete product')
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}

// Quote API functions
export async function getQuotes() {
  try {
    const response = await fetch('/api/quotes')
    if (!response.ok) {
      throw new Error('Failed to fetch quotes')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return { success: false, error: 'Failed to fetch quotes' }
  }
}

export async function createQuote(quoteData: any) {
  try {
    const response = await fetch('/api/quotes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteData),
    })
    if (!response.ok) {
      throw new Error('Failed to create quote')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating quote:', error)
    return { success: false, error: 'Failed to create quote' }
  }
}

export async function updateQuote(id: string, quoteData: any) {
  try {
    const response = await fetch(`/api/quotes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteData),
    })
    if (!response.ok) {
      throw new Error('Failed to update quote')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating quote:', error)
    return { success: false, error: 'Failed to update quote' }
  }
}

export async function deleteQuote(id: string) {
  try {
    const response = await fetch(`/api/quotes/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete quote')
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting quote:', error)
    return { success: false, error: 'Failed to delete quote' }
  }
}

// Role API functions
export async function getRoles() {
  try {
    const response = await fetch('/api/roles')
    if (!response.ok) {
      throw new Error('Failed to fetch roles')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching roles:', error)
    return { success: false, error: 'Failed to fetch roles' }
  }
}

export async function createRole(roleData: any) {
  try {
    const response = await fetch('/api/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    })
    if (!response.ok) {
      throw new Error('Failed to create role')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating role:', error)
    return { success: false, error: 'Failed to create role' }
  }
}

export async function updateRole(id: string, roleData: any) {
  try {
    const response = await fetch(`/api/roles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    })
    if (!response.ok) {
      throw new Error('Failed to update role')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating role:', error)
    return { success: false, error: 'Failed to update role' }
  }
}

export async function deleteRole(id: string) {
  try {
    const response = await fetch(`/api/roles/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete role')
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting role:', error)
    return { success: false, error: 'Failed to delete role' }
  }
}

// Dashboard API functions
export async function getDashboardStats() {
  try {
    const response = await fetch('/api/dashboard/stats')
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { success: false, error: 'Failed to fetch dashboard stats' }
  }
}

// Document API functions
export async function getDocuments() {
  try {
    const response = await fetch('/api/documents')
    if (!response.ok) {
      throw new Error('Failed to fetch documents')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching documents:', error)
    return { success: false, error: 'Failed to fetch documents' }
  }
}

export async function createDocument(documentData: any) {
  try {
    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData),
    })
    if (!response.ok) {
      throw new Error('Failed to create document')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating document:', error)
    return { success: false, error: 'Failed to create document' }
  }
}

export async function updateDocument(id: string, documentData: any) {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData),
    })
    if (!response.ok) {
      throw new Error('Failed to update document')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating document:', error)
    return { success: false, error: 'Failed to update document' }
  }
}

export async function deleteDocument(id: string) {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete document')
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting document:', error)
    return { success: false, error: 'Failed to delete document' }
  }
}

// Message API functions
export async function getMessages() {
  try {
    const response = await fetch('/api/messages')
    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return { success: false, error: 'Failed to fetch messages' }
  }
}

export async function createMessage(messageData: any) {
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    })
    if (!response.ok) {
      throw new Error('Failed to create message')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating message:', error)
    return { success: false, error: 'Failed to create message' }
  }
}

export async function updateMessage(id: string, messageData: any) {
  try {
    const response = await fetch(`/api/messages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData),
    })
    if (!response.ok) {
      throw new Error('Failed to update message')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating message:', error)
    return { success: false, error: 'Failed to update message' }
  }
}

export async function deleteMessage(id: string) {
  try {
    const response = await fetch(`/api/messages/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete message')
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting message:', error)
    return { success: false, error: 'Failed to delete message' }
  }
}

// Note API functions
export async function getNotes() {
  try {
    const response = await fetch('/api/notes')
    if (!response.ok) {
      throw new Error('Failed to fetch notes')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching notes:', error)
    return { success: false, error: 'Failed to fetch notes' }
  }
}

// Business-related data API functions
export async function getBusinessContacts(businessId: string) {
  try {
    const response = await authenticatedFetch(`/api/businesses/${businessId}/contacts`)
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching business contacts:', error)
    return { success: false, error: error.message || 'Failed to fetch business contacts' }
  }
}

export async function createBusinessContact(businessId: string, contactData: any) {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/businesses/${businessId}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(contactData),
    })
    if (!response.ok) {
      throw new Error('Failed to create business contact')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating business contact:', error)
    return { success: false, error: 'Failed to create business contact' }
  }
}

export async function updateBusinessContact(businessId: string, contactId: string, contactData: any) {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/businesses/${businessId}/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(contactData),
    })
    if (!response.ok) {
      throw new Error('Failed to update business contact')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating business contact:', error)
    return { success: false, error: 'Failed to update business contact' }
  }
}

export async function deleteBusinessContact(businessId: string, contactId: string) {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/businesses/${businessId}/contacts/${contactId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })
    if (!response.ok) {
      throw new Error('Failed to delete business contact')
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting business contact:', error)
    return { success: false, error: 'Failed to delete business contact' }
  }
}

export async function getBusinessTasks(businessId: string) {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/businesses/${businessId}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    if (!response.ok) {
      throw new Error('Failed to fetch business tasks')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching business tasks:', error)
    return { success: false, error: 'Failed to fetch business tasks' }
  }
}

export async function createBusinessTask(businessId: string, taskData: any) {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/businesses/${businessId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(taskData),
    })
    if (!response.ok) {
      throw new Error('Failed to create business task')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating business task:', error)
    return { success: false, error: 'Failed to create business task' }
  }
}

export async function getBusinessNotes(businessId: string) {
  try {
    const response = await authenticatedFetch(`/api/businesses/${businessId}/notes`)
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching business notes:', error)
    return { success: false, error: error.message || 'Failed to fetch business notes' }
  }
}

export async function createBusinessNote(businessId: string, noteData: any) {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/businesses/${businessId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(noteData),
    })
    if (!response.ok) {
      throw new Error('Failed to create business note')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating business note:', error)
    return { success: false, error: 'Failed to create business note' }
  }
}

export async function updateBusinessNote(businessId: string, noteId: string, noteData: any) {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/businesses/${businessId}/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(noteData),
    })
    if (!response.ok) {
      throw new Error('Failed to update business note')
    }
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating business note:', error)
    return { success: false, error: 'Failed to update business note' }
  }
}

export async function deleteBusinessNote(businessId: string, noteId: string) {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/businesses/${businessId}/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    })
    if (!response.ok) {
      throw new Error('Failed to delete business note')
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting business note:', error)
    return { success: false, error: 'Failed to delete business note' }
  }
}

export async function getBusinessProducts(businessId: string) {
  try {
    const response = await authenticatedFetch(`/api/businesses/${businessId}/products`)
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching business products:', error)
    return { success: false, error: error.message || 'Failed to fetch business products' }
  }
}

// Product Instances API functions
export async function getProductInstances(params?: {
  productId?: string
  businessId?: string
  status?: string
  search?: string
  productIds?: string
}) {
  try {
    // Build query string
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const queryString = searchParams.toString()
    const url = `/api/product-instances${queryString ? `?${queryString}` : ''}`
    
    const response = await authenticatedFetch(url)
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching product instances:', error)
    return { success: false, error: error.message || 'Failed to fetch product instances' }
  }
}

export async function createProductInstance(instanceData: any) {
  try {
    const response = await authenticatedFetch('/api/product-instances', {
      method: 'POST',
      body: JSON.stringify(instanceData),
    })
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error creating product instance:', error)
    return { success: false, error: error.message || 'Failed to create product instance' }
  }
}

export async function updateProductInstance(id: string, instanceData: any) {
  try {
    const response = await authenticatedFetch(`/api/product-instances/${id}`, {
      method: 'PUT',
      body: JSON.stringify(instanceData),
    })
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error updating product instance:', error)
    return { success: false, error: error.message || 'Failed to update product instance' }
  }
}

export async function addBusinessProduct(businessId: string, productId: string) {
  try {
    const response = await authenticatedFetch(`/api/businesses/${businessId}/products/${productId}`, {
      method: 'POST',
    })
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error adding business product:', error)
    return { success: false, error: error.message || 'Failed to add business product' }
  }
}

export async function removeBusinessProduct(businessId: string, productId: string) {
  try {
    const response = await authenticatedFetch(`/api/businesses/${businessId}/products/${productId}`, {
      method: 'DELETE',
    })
    return { success: true }
  } catch (error) {
    console.error('Error removing business product:', error)
    return { success: false, error: error.message || 'Failed to remove business product' }
  }
}

export async function getBusinessQuotes(businessId: string) {
  try {
    const response = await authenticatedFetch(`/api/businesses/${businessId}/quotes`)
    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching business quotes:', error)
    return { success: false, error: error.message || 'Failed to fetch business quotes' }
  }
}