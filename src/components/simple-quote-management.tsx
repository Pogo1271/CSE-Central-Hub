'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  FileSignature, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  Package,
  PoundSterling,
  Calendar,
  User,
  Save,
  X,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'

// Import client API
import * as api from '@/lib/client-api'

interface Quote {
  id: string
  title: string
  description?: string
  businessId: string
  business: {
    id: string
    name: string
    email?: string
    phone?: string
    location?: string
  }
  userId?: string
  user?: {
    id: string
    name: string
    email: string
  }
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  totalAmount: number
  createdAt: string
  updatedAt: string
  items: QuoteItem[]
}

interface QuoteItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    description?: string
    price: number
    pricingType: 'one-off' | 'monthly'
    category?: string
    sku?: string
  }
  quantity: number
  price: number
  createdAt: string
}

interface Business {
  id: string
  name: string
  email?: string
  phone?: string
  location?: string
  category?: string
  status: string
}

interface Product {
  id: string
  name: string
  description?: string
  price: number
  pricingType: 'one-off' | 'monthly'
  category?: string
  sku?: string
  stock: number
}

interface QuoteFormData {
  title: string
  description?: string
  businessId: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  items: QuoteItemFormData[]
}

interface QuoteItemFormData {
  productId: string
  quantity: number
  price: number
  category: 'hardware' | 'software'
}

export default function SimpleQuoteManagement() {
  const { isAuthenticated, user: currentUser } = useAuth()
  
  // Data state
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  
  const [formData, setFormData] = useState<QuoteFormData>({
    title: '',
    description: '',
    businessId: '',
    status: 'draft',
    items: []
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Utility functions
  const formatDate = (date: string) => {
    try {
      const d = new Date(date)
      return d.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Load data
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadData()
    }
  }, [isAuthenticated, currentUser])
  
  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load quotes
      const quotesResponse = await api.getQuotes()
      if (quotesResponse.success) {
        setQuotes(quotesResponse.data || [])
      }
      
      // Load businesses
      const businessesResponse = await api.getBusinesses()
      if (businessesResponse.success) {
        setBusinesses(businessesResponse.data || [])
      }
      
      // Load products
      const productsResponse = await api.getProducts()
      if (productsResponse.success) {
        setProducts(productsResponse.data || [])
      }
      
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  
  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.business.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })
  
  // Handle form changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Add item to quote
  const addItemToQuote = (product: Product) => {
    const newItem: QuoteItemFormData = {
      productId: product.id,
      quantity: 1,
      price: product.price,
      category: product.pricingType === 'one-off' ? 'hardware' : 'software'
    }
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }
  
  // Remove item from quote
  const removeItemFromQuote = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }
  
  // Update item quantity
  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, quantity } : item
      )
    }))
  }
  
  // Calculate quote total
  const calculateQuoteTotal = () => {
    return formData.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
  
  // Create quote
  const handleCreateQuote = async () => {
    if (!formData.title || !formData.businessId || formData.items.length === 0) {
      toast.error('Please fill in all required fields and add at least one item')
      return
    }
    
    try {
      const quoteData = {
        ...formData,
        totalAmount: calculateQuoteTotal()
      }
      
      const response = await api.createQuote(quoteData)
      
      if (response.success) {
        toast.success('Quote created successfully')
        setIsCreateDialogOpen(false)
        setFormData({
          title: '',
          description: '',
          businessId: '',
          status: 'draft',
          items: []
        })
        loadData()
      } else {
        toast.error(response.message || 'Failed to create quote')
      }
    } catch (error) {
      console.error('Error creating quote:', error)
      toast.error('Failed to create quote')
    }
  }
  
  // View quote details
  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsViewDialogOpen(true)
  }
  
  // Generate PDF (simplified - just shows a message for now)
  const handleGeneratePDF = async (quoteId: string) => {
    try {
      toast.info('PDF generation would start here...')
      // In a real implementation, you would call the PDF generation API
      // const response = await api.generateQuotePDF(quoteId)
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF')
    }
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quotes...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quote Management</h1>
          <p className="text-gray-600 mt-2">Create and manage customer quotes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
              <DialogDescription>
                Create a new quote for a customer
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Quote Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter quote title"
                  />
                </div>
                <div>
                  <Label htmlFor="business">Business *</Label>
                  <Select value={formData.businessId} onValueChange={(value) => handleInputChange('businessId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter quote description"
                  rows={3}
                />
              </div>
              
              {/* Items Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Quote Items</h3>
                  <span className="text-sm text-gray-600">
                    Total: {formatCurrency(calculateQuoteTotal())}
                  </span>
                </div>
                
                {/* Product Selection */}
                <div className="mb-4">
                  <Label>Available Products</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {formatCurrency(product.price)} / {product.pricingType === 'one-off' ? 'each' : 'month'}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addItemToQuote(product)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Selected Items */}
                {formData.items.length > 0 && (
                  <div>
                    <Label>Selected Items</Label>
                    <div className="border rounded-lg mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.items.map((item, index) => {
                            const product = products.find(p => p.id === item.productId)
                            return (
                              <TableRow key={index}>
                                <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                                <TableCell>{formatCurrency(item.price)}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => removeItemFromQuote(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateQuote}>
                  <Save className="h-4 w-4 mr-2" />
                  Create Quote
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quotes</CardTitle>
          <CardDescription>
            Manage your customer quotes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.title}</TableCell>
                  <TableCell>{quote.business.name}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(quote.totalAmount)}</TableCell>
                  <TableCell>{formatDate(quote.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewQuote(quote)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGeneratePDF(quote.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredQuotes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No quotes found</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* View Quote Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Title</h3>
                  <p>{selectedQuote.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <Badge className={getStatusColor(selectedQuote.status)}>
                    {selectedQuote.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-semibold">Business</h3>
                  <p>{selectedQuote.business.name}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Total Amount</h3>
                  <p>{formatCurrency(selectedQuote.totalAmount)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Created</h3>
                  <p>{formatDate(selectedQuote.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Last Updated</h3>
                  <p>{formatDate(selectedQuote.updatedAt)}</p>
                </div>
              </div>
              
              {selectedQuote.description && (
                <div>
                  <h3 className="font-semibold">Description</h3>
                  <p>{selectedQuote.description}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold">Items</h3>
                <div className="border rounded-lg mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQuote.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}