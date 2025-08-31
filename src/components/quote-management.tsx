'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
  Filter,
  Download,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings,
  HardDrive,
  Cloud,
  Monitor,
  Keyboard,
  Mouse,
  Printer,
  Scanner,
  PlusCircle,
  MinusCircle,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

export default function QuoteManagement({ editQuoteId, onEditComplete, searchTerm }: { editQuoteId?: string; onEditComplete?: () => void; searchTerm?: string }) {
  const { user: currentUser } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  
  // Modal states
  const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState(false)
  const [isEditQuoteOpen, setIsEditQuoteOpen] = useState(false)
  const [isViewQuoteOpen, setIsViewQuoteOpen] = useState(false)
  
  // Form states
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [formData, setFormData] = useState<QuoteFormData>({
    title: '',
    description: '',
    businessId: '',
    status: 'draft',
    items: []
  })
  
  // Product search states - add immediate search states for debouncing
  const [hardwareSearchTerm, setHardwareSearchTerm] = useState('')
  const [softwareSearchTerm, setSoftwareSearchTerm] = useState('')
  const [immediateHardwareSearch, setImmediateHardwareSearch] = useState('')
  const [immediateSoftwareSearch, setImmediateSoftwareSearch] = useState('')
  const [showHardwareDropdown, setShowHardwareDropdown] = useState(false)
  const [showSoftwareDropdown, setShowSoftwareDropdown] = useState(false)
  
  // Refs for click-outside detection
  const hardwareDropdownRef = useRef<HTMLDivElement>(null)
  const softwareDropdownRef = useRef<HTMLDivElement>(null)

  // Debounced search effects
  useEffect(() => {
    const timer = setTimeout(() => {
      setHardwareSearchTerm(immediateHardwareSearch)
    }, 300) // 300ms delay
    return () => clearTimeout(timer)
  }, [immediateHardwareSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSoftwareSearchTerm(immediateSoftwareSearch)
    }, 300) // 300ms delay
    return () => clearTimeout(timer)
  }, [immediateSoftwareSearch])

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hardwareDropdownRef.current && !hardwareDropdownRef.current.contains(event.target as Node)) {
        setShowHardwareDropdown(false)
      }
      if (softwareDropdownRef.current && !softwareDropdownRef.current.contains(event.target as Node)) {
        setShowSoftwareDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Filter quotes based on search and status
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (quote.description && quote.description.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'All Statuses' || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Filter products for dropdowns - memoized for performance
  const hardwareProducts = useMemo(() => 
    products.filter(product => 
      product.pricingType === 'one-off' && 
      product.name.toLowerCase().includes(hardwareSearchTerm.toLowerCase())
    ), [products, hardwareSearchTerm])
  
  const softwareProducts = useMemo(() => 
    products.filter(product => 
      product.pricingType === 'monthly' && 
      product.name.toLowerCase().includes(softwareSearchTerm.toLowerCase())
    ), [products, softwareSearchTerm])

  // Load data
  useEffect(() => {
    loadData()
  }, [])

  // Handle editQuoteId prop
  useEffect(() => {
    if (editQuoteId && quotes.length > 0) {
      const quoteToEdit = quotes.find(q => q.id === editQuoteId)
      if (quoteToEdit) {
        handleEditQuote(quoteToEdit)
      }
    }
  }, [editQuoteId, quotes])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load quotes
      const quotesResponse = await api.getQuotes()
      if (quotesResponse.success) {
        setQuotes(quotesResponse.data)
      }
      
      // Load businesses
      const businessesResponse = await api.getBusinesses()
      if (businessesResponse.success) {
        setBusinesses(businessesResponse.data)
      }
      
      // Load products
      const productsResponse = await api.getProducts()
      if (productsResponse.success) {
        setProducts(productsResponse.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    try {
      const d = new Date(date)
      return d.toLocaleDateString('en-US', {
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
      sent: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Sent' },
      accepted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', icon: X, label: 'Rejected' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      businessId: '',
      status: 'draft',
      items: []
    })
    setHardwareSearchTerm('')
    setSoftwareSearchTerm('')
    setImmediateHardwareSearch('')
    setImmediateSoftwareSearch('')
  }

  const handleCreateQuote = async () => {
    try {
      const response = await api.createQuote(formData)
      if (response.success) {
        setQuotes([response.data, ...quotes])
        setIsCreateQuoteOpen(false)
        resetForm()
        toast.success('Quote created successfully')
      }
    } catch (error) {
      console.error('Error creating quote:', error)
      toast.error('Failed to create quote')
    }
  }

  const handleUpdateQuote = async () => {
    if (!selectedQuote) return
    
    try {
      const response = await api.updateQuote(selectedQuote.id, formData)
      if (response.success) {
        setQuotes(quotes.map(q => q.id === selectedQuote.id ? response.data : q))
        setIsEditQuoteOpen(false)
        setSelectedQuote(null)
        resetForm()
        toast.success('Quote updated successfully')
        
        // Call the callback to clear editQuoteId in parent
        if (onEditComplete) {
          onEditComplete()
        }
      }
    } catch (error) {
      console.error('Error updating quote:', error)
      toast.error('Failed to update quote')
    }
  }

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return
    
    try {
      const response = await api.deleteQuote(quoteId)
      if (response.success) {
        setQuotes(quotes.filter(q => q.id !== quoteId))
        toast.success('Quote deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting quote:', error)
      toast.error('Failed to delete quote')
    }
  }

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setFormData({
      title: quote.title,
      description: quote.description || '',
      businessId: quote.businessId,
      status: quote.status,
      items: quote.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        category: item.product.pricingType === 'one-off' ? 'hardware' : 'software'
      }))
    })
    setIsEditQuoteOpen(true)
  }

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote)
    setIsViewQuoteOpen(true)
  }

  // Optimized addProductToQuote function - memoized for performance
  const addProductToQuote = useCallback((product: Product, category: 'hardware' | 'software') => {
    const existingItemIndex = formData.items.findIndex(item => 
      item.productId === product.id && item.category === category
    )
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      const updatedItems = [...formData.items]
      updatedItems[existingItemIndex].quantity += 1
      setFormData(prev => ({ ...prev, items: updatedItems }))
    } else {
      // Add new product
      const newItem: QuoteItemFormData = {
        productId: product.id,
        quantity: 1,
        price: product.price,
        category
      }
      setFormData(prev => ({ 
        ...prev, 
        items: [...prev.items, newItem] 
      }))
    }
    
    // Clear search and hide dropdown
    if (category === 'hardware') {
      setHardwareSearchTerm('')
      setImmediateHardwareSearch('')
      setShowHardwareDropdown(false)
    } else {
      setSoftwareSearchTerm('')
      setImmediateSoftwareSearch('')
      setShowSoftwareDropdown(false)
    }
  }, [formData.items])

  const removeQuoteItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, items: updatedItems }))
  }

  const updateQuoteItemQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return
    
    const updatedItems = [...formData.items]
    updatedItems[index].quantity = quantity
    setFormData(prev => ({ ...prev, items: updatedItems }))
  }

  const calculateQuoteTotals = () => {
    const hardwareItems = formData.items.filter(item => item.category === 'hardware')
    const softwareItems = formData.items.filter(item => item.category === 'software')
    
    const hardwareTotal = hardwareItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const softwareTotal = softwareItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const subtotal = hardwareTotal + softwareTotal
    const vat = subtotal * 0.20 // 20% VAT
    const total = subtotal + vat
    
    return {
      hardwareTotal,
      softwareTotal,
      subtotal,
      vat,
      total
    }
  }

  const totals = calculateQuoteTotals()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quotes & Proposals</h2>
            <p className="text-gray-600 mt-1">Manage client quotes and business proposals</p>
          </div>
          <Button 
            onClick={() => {
              resetForm()
              setIsCreateQuoteOpen(true)
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Quotes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredQuotes.map((quote) => (
          <Card key={quote.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                    {quote.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 truncate">{quote.business.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(quote.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewQuote(quote)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditQuote(quote)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {quote.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{quote.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{formatDate(quote.createdAt)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(quote.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {quote.items.length} items
                    </p>
                  </div>
                </div>

                {quote.user && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{quote.user.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <Card className="bg-white shadow-sm">
          <CardContent className="p-12 text-center">
            <FileSignature className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No quotes found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'All Statuses' 
                ? 'Try adjusting your filters or search terms.'
                : 'Create your first quote to get started.'
              }
            </p>
            {(!searchTerm && statusFilter === 'All Statuses') && (
              <Button 
                onClick={() => {
                  resetForm()
                  setIsCreateQuoteOpen(true)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Quote
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Quote Modal */}
      <Dialog 
        open={isCreateQuoteOpen || isEditQuoteOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateQuoteOpen(false)
            setIsEditQuoteOpen(false)
            setSelectedQuote(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="!w-[50vw] !max-w-none max-h-[90vh] overflow-y-auto p-8" style={{ width: '50vw' }}>
          <DialogHeader>
            <DialogTitle>
              {isEditQuoteOpen ? 'Edit Quote' : 'Create New Quote'}
            </DialogTitle>
            <DialogDescription>
              {isEditQuoteOpen ? 'Update quote details and items' : 'Create a new quote for a client'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Quote Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter quote title"
                />
              </div>
              
              <div>
                <Label htmlFor="business">Business</Label>
                <Select value={formData.businessId} onValueChange={(value) => setFormData(prev => ({ ...prev, businessId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
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
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter quote description"
                rows={3}
              />
            </div>

            {/* Items Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Quote Items</h3>
              
              {/* Hardware Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Hardware (One-off)</h4>
                </div>
                
                <div className="relative mb-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search hardware products..."
                        value={immediateHardwareSearch}
                        onChange={(e) => setImmediateHardwareSearch(e.target.value)}
                        onFocus={() => setShowHardwareDropdown(true)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowHardwareDropdown(!showHardwareDropdown)}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {showHardwareDropdown && hardwareProducts.length > 0 && (
                    <div ref={hardwareDropdownRef} className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {hardwareProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => addProductToQuote(product, 'hardware')}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.description && (
                                <p className="text-sm text-gray-600">{product.description}</p>
                              )}
                              {product.sku && (
                                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(product.price)}</p>
                              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hardware Items List */}
                <div className="space-y-2">
                  {formData.items.filter(item => item.category === 'hardware').map((item, index) => {
                    const product = products.find(p => p.id === item.productId)
                    const originalIndex = formData.items.findIndex(i => 
                      i.productId === item.productId && i.category === 'hardware'
                    )
                    
                    return (
                      <div key={`${item.productId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuoteItemQuantity(originalIndex, item.quantity - 1)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuoteItemQuantity(originalIndex, item.quantity + 1)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuoteItem(originalIndex)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Software Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Cloud className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium">Software (Monthly)</h4>
                </div>
                
                <div className="relative mb-3">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search software products..."
                        value={immediateSoftwareSearch}
                        onChange={(e) => setImmediateSoftwareSearch(e.target.value)}
                        onFocus={() => setShowSoftwareDropdown(true)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowSoftwareDropdown(!showSoftwareDropdown)}
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {showSoftwareDropdown && softwareProducts.length > 0 && (
                    <div ref={softwareDropdownRef} className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {softwareProducts.map((product) => (
                        <div
                          key={product.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => addProductToQuote(product, 'software')}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.description && (
                                <p className="text-sm text-gray-600">{product.description}</p>
                              )}
                              {product.sku && (
                                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(product.price)}/month</p>
                              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Software Items List */}
                <div className="space-y-2">
                  {formData.items.filter(item => item.category === 'software').map((item, index) => {
                    const product = products.find(p => p.id === item.productId)
                    const originalIndex = formData.items.findIndex(i => 
                      i.productId === item.productId && i.category === 'software'
                    )
                    
                    return (
                      <div key={`${item.productId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)}/month</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuoteItemQuantity(originalIndex, item.quantity - 1)}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuoteItemQuantity(originalIndex, item.quantity + 1)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuoteItem(originalIndex)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Quote Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Hardware Total:</span>
                    <span>{formatCurrency(totals.hardwareTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Software Total:</span>
                    <span>{formatCurrency(totals.softwareTotal)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (20%):</span>
                    <span>{formatCurrency(totals.vat)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Selection */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateQuoteOpen(false)
                  setIsEditQuoteOpen(false)
                  setSelectedQuote(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={isEditQuoteOpen ? handleUpdateQuote : handleCreateQuote}
                disabled={!formData.title || !formData.businessId || formData.items.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditQuoteOpen ? 'Update Quote' : 'Create Quote'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Quote Modal */}
      <Dialog open={isViewQuoteOpen} onOpenChange={setIsViewQuoteOpen}>
        <DialogContent className="!w-[50vw] !max-w-none max-h-[90vh] overflow-y-auto p-8" style={{ width: '50vw' }}>
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
            <DialogDescription>View quote information and items</DialogDescription>
          </DialogHeader>
          
          {selectedQuote && (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Quote Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Title:</span>
                      <p className="font-medium">{selectedQuote.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedQuote.status)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Created:</span>
                      <p className="font-medium">{formatDate(selectedQuote.createdAt)}</p>
                    </div>
                    {selectedQuote.description && (
                      <div>
                        <span className="text-sm text-gray-600">Description:</span>
                        <p className="font-medium">{selectedQuote.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Business Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Business:</span>
                      <p className="font-medium">{selectedQuote.business.name}</p>
                    </div>
                    {selectedQuote.business.email && (
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <p className="font-medium">{selectedQuote.business.email}</p>
                      </div>
                    )}
                    {selectedQuote.business.phone && (
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <p className="font-medium">{selectedQuote.business.phone}</p>
                      </div>
                    )}
                    {selectedQuote.business.location && (
                      <div>
                        <span className="text-sm text-gray-600">Location:</span>
                        <p className="font-medium">{selectedQuote.business.location}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quote Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Quote Items</h3>
                
                {/* Hardware Items */}
                {selectedQuote.items.filter(item => item.product.pricingType === 'one-off').length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <HardDrive className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Hardware (One-off)</h4>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedQuote.items
                          .filter(item => item.product.pricingType === 'one-off')
                          .map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.product.name}</TableCell>
                              <TableCell>{item.product.description || '-'}</TableCell>
                              <TableCell>{formatCurrency(item.price)}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Software Items */}
                {selectedQuote.items.filter(item => item.product.pricingType === 'monthly').length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Cloud className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium">Software (Monthly)</h4>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Price/Month</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Total/Month</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedQuote.items
                          .filter(item => item.product.pricingType === 'monthly')
                          .map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.product.name}</TableCell>
                              <TableCell>{item.product.description || '-'}</TableCell>
                              <TableCell>{formatCurrency(item.price)}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Quote Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quote Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedQuote.items.filter(item => item.product.pricingType === 'one-off').length > 0 && (
                        <div className="flex justify-between">
                          <span>Hardware Total:</span>
                          <span>{formatCurrency(
                            selectedQuote.items
                              .filter(item => item.product.pricingType === 'one-off')
                              .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                          )}</span>
                        </div>
                      )}
                      {selectedQuote.items.filter(item => item.product.pricingType === 'monthly').length > 0 && (
                        <div className="flex justify-between">
                          <span>Software Total:</span>
                          <span>{formatCurrency(
                            selectedQuote.items
                              .filter(item => item.product.pricingType === 'monthly')
                              .reduce((sum, item) => sum + (item.price * item.quantity), 0)
                          )}/month</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedQuote.totalAmount / 1.2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (20%):</span>
                        <span>{formatCurrency(selectedQuote.totalAmount - (selectedQuote.totalAmount / 1.2))}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedQuote.totalAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewQuoteOpen(false)}>
                  Close
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsViewQuoteOpen(false)
                    handleEditQuote(selectedQuote)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Quote
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}