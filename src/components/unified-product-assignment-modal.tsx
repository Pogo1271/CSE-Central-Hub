'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Search, 
  User, 
  Building, 
  Calendar, 
  Shield, 
  Key,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Minus,
  Hash,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { getToken } from '@/lib/auth'

interface Product {
  id: string
  name: string
  category: string
  price: number
  description?: string
  sku?: string
  isSerialized: boolean
}

interface ProductInstance {
  id: string
  serialNumber?: string
  licenseNumber?: string
  status: string
  businessId?: string
  contactId?: string
  soldDate?: string
  warrantyExpiry?: string
  comments?: string
  isLicense?: boolean
  product: {
    id: string
    name: string
    category: string
    price: number
    isSerialized: boolean
  }
  business?: {
    id: string
    name: string
  }
  contact?: {
    id: string
    name: string
    email: string
    phone: string
  }
}

interface Business {
  id: string
  name: string
}

interface UnifiedProductAssignmentModalProps {
  business: Business
  open: boolean
  onClose: () => void
  onAssignmentComplete: () => void
}

// Status options for different product types
const serializedStatusOptions = [
  { value: 'sold', label: 'Sold', description: 'Sold to customer' },
  { value: 'on-car', label: 'On Car', description: 'Installed in vehicle' },
  { value: 'office-use', label: 'Office Use', description: 'Internal company use' },
  { value: 'swapped', label: 'Swapped', description: 'Replaced/Exchanged unit' },
]

const nonSerializedStatusOptions = [
  { value: 'active', label: 'Active', description: 'Currently assigned and active' },
  { value: 'inactive', label: 'Inactive', description: 'Assigned but not currently active' },
  { value: 'cancelled', label: 'Cancelled', description: 'Assignment has been cancelled' }
]

const statusConfig = {
  // Serialized product statuses
  'in-stock': { 
    label: 'In Stock', 
    color: 'bg-green-100 text-green-800', 
    icon: Package,
    description: 'Available for sale'
  },
  'sold': { 
    label: 'Sold', 
    color: 'bg-blue-100 text-blue-800', 
    icon: CheckCircle,
    description: 'Assigned to customer'
  },
  'on-car': { 
    label: 'On Car', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock,
    description: 'Installed in vehicle'
  },
  'office-use': { 
    label: 'Office Use', 
    color: 'bg-purple-100 text-purple-800', 
    icon: Building,
    description: 'Internal use only'
  },
  'swapped': { 
    label: 'Swapped', 
    color: 'bg-orange-100 text-orange-800', 
    icon: AlertTriangle,
    description: 'Replaced/Exchanged'
  },
  // Non-serialized product statuses
  'active': { 
    label: 'Active', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle,
    description: 'Currently assigned and active'
  },
  'inactive': { 
    label: 'Inactive', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock,
    description: 'Assigned but not currently active'
  },
  'cancelled': { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800', 
    icon: AlertTriangle,
    description: 'Assignment has been cancelled'
  }
}

// Warranty periods for different product categories
const warrantyPeriods: Record<string, number> = {
  'Hardware': 12, // 12 months
  'Software': 6,  // 6 months
  'Services': 3,  // 3 months
  'Support': 12, // 12 months
}

export default function UnifiedProductAssignmentModal({ 
  business, 
  open, 
  onClose, 
  onAssignmentComplete 
}: UnifiedProductAssignmentModalProps) {
  const { user: currentUser } = useAuth()
  
  // Product selection state
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([]) // For search purposes
  const [productInstances, setProductInstances] = useState<ProductInstance[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filteredInstances, setFilteredInstances] = useState<ProductInstance[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedInstance, setSelectedInstance] = useState<ProductInstance | null>(null)
  
  // Form state
  const [quantity, setQuantity] = useState<number>(1)
  const [status, setStatus] = useState<string>('sold')
  const [comments, setComments] = useState<string>('')
  const [warrantyExpiry, setWarrantyExpiry] = useState<string>('')
  const [validFrom, setValidFrom] = useState<string>(new Date().toISOString().split('T')[0])
  const [validTo, setValidTo] = useState<string>('')
  
  // UI state
  const [isAssigning, setIsAssigning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [productFilter, setProductFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'products' | 'serial-numbers'>('products')
  const [existingAssignments, setExistingAssignments] = useState<any[]>([])

  // Load products and instances
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getToken()
        
        // Load all products
        const productsResponse = await fetch('/api/products', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (productsResponse.ok) {
          const productsData = await productsResponse.json()
          setAllProducts(productsData) // Store all products for search
          // Filter out serialized products - only show non-serialized products in the products list
          const nonSerializedProducts = productsData.filter((product: Product) => !product.isSerialized)
          setProducts(nonSerializedProducts)
          setFilteredProducts(nonSerializedProducts)
        }

        // Load available product instances (serialized)
        const instancesResponse = await fetch('/api/product-instances?status=in-stock', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (instancesResponse.ok) {
          const instancesData = await instancesResponse.json()
          setProductInstances(instancesData)
          setFilteredInstances(instancesData)
        }

        // Load existing assignments
        const assignmentsResponse = await fetch(`/api/businesses/${business.id}/products`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (assignmentsResponse.ok) {
          const assignments = await assignmentsResponse.json()
          setExistingAssignments(assignments)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }

    if (open) {
      loadData()
      resetForm()
    }
  }, [open, business.id])

  // Filter products and instances
  useEffect(() => {
    // Filter products (non-serialized only for display)
    let filteredProds = products
    if (searchTerm) {
      // Search across all products but only show non-serialized ones
      const matchingProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      // Only include non-serialized products in the results
      filteredProds = matchingProducts.filter(product => !product.isSerialized)
    }
    if (categoryFilter !== 'all') {
      filteredProds = filteredProds.filter(product => product.category === categoryFilter)
    }
    setFilteredProducts(filteredProds)

    // Filter instances (serialized products)
    let filteredInst = productInstances
    if (searchTerm) {
      filteredInst = filteredInst.filter(instance =>
        instance.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instance.product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (categoryFilter !== 'all') {
      filteredInst = filteredInst.filter(instance => instance.product.category === categoryFilter)
    }
    setFilteredInstances(filteredInst)
  }, [products, productInstances, allProducts, searchTerm, categoryFilter])

  // Smart tab switching based on search content
  useEffect(() => {
    if (searchTerm && searchTerm.length > 2) {
      const searchLower = searchTerm.toLowerCase()
      
      // Check if search term looks like a serial number pattern
      const serialPatterns = [
        /^[a-z]{2,}-\d{3,}$/i,  // CD-001, OS-ML-002, etc.
        /^\d{4,}$/,              // 1234, 5678, etc.
        /^[a-z]\d{3,}$/i,         // A123, B456, etc.
        /serial/i,                // contains "serial"
        /license/i,               // contains "license"
      ]
      
      const isLikelySerialNumber = serialPatterns.some(pattern => pattern.test(searchLower))
      
      // Check if search term matches any serial numbers or serialized products
      const hasMatchingSerialNumbers = productInstances.some(instance =>
        instance.serialNumber?.toLowerCase().includes(searchLower) ||
        instance.licenseNumber?.toLowerCase().includes(searchLower)
      )
      
      const hasMatchingSerializedProducts = allProducts.some(product =>
        product.isSerialized && (
          product.name.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower)
        )
      )
      
      // Auto-switch to serialized tab if search looks like serial number or has matches
      if ((isLikelySerialNumber || hasMatchingSerialNumbers || hasMatchingSerializedProducts) && activeTab === 'products') {
        console.log('Auto-switching to serialized tab for search:', searchTerm)
        setActiveTab('serial-numbers')
      }
      
      // Auto-switch to non-serialized tab if search matches non-serialized products
      const hasMatchingNonSerializedProducts = products.some(product =>
        !product.isSerialized && (
          product.name.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower)
        )
      )
      
      if (hasMatchingNonSerializedProducts && !hasMatchingSerialNumbers && !hasMatchingSerializedProducts && activeTab === 'serial-numbers') {
        console.log('Auto-switching to non-serialized tab for search:', searchTerm)
        setActiveTab('products')
      }
    }
  }, [searchTerm, activeTab, productInstances, allProducts, products])

  // Reset form when selection changes
  const resetForm = () => {
    setSelectedProduct(null)
    setSelectedInstance(null)
    setQuantity(1)
    setStatus('sold')
    setComments('')
    setWarrantyExpiry('')
    setValidFrom(new Date().toISOString().split('T')[0])
    setValidTo('')
    setSearchTerm('')
    setCategoryFilter('all')
    setActiveTab('products')
  }

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    // Prevent selecting serialized products from non-serialized tab
    if (product.isSerialized) {
      alert('This is a serialized product. Please select it from the "Serialized" tab.')
      setActiveTab('serial-numbers')
      return
    }
    
    setSelectedProduct(product)
    setSelectedInstance(null)
    setQuantity(1)
    
    // Set default status based on product type
    setStatus('active')
    setActiveTab('products')
    
    setComments('')
    setValidFrom(new Date().toISOString().split('T')[0])
    setValidTo('')
  }

  // Handle instance selection
  const handleInstanceSelect = (instance: ProductInstance) => {
    console.log('Instance selected:', {
      instanceId: instance.id,
      productName: instance.product.name,
      isSerialized: instance.product.isSerialized,
      productId: instance.product.id
    })
    
    setSelectedInstance(instance)
    setSelectedProduct(instance.product)
    setStatus('sold')
    setWarrantyExpiry(calculateDefaultWarrantyExpiry(instance.product.category))
    setComments('')
    
    // Log immediately after setting state
    setTimeout(() => {
      console.log('State after setting selectedProduct from instance:', {
        selectedProductName: selectedProduct?.name,
        selectedProductIsSerialized: selectedProduct?.isSerialized,
        selectedProductId: selectedProduct?.id
      })
    }, 0)
  }

  // Calculate default warranty expiry
  const calculateDefaultWarrantyExpiry = (category?: string) => {
    const months = warrantyPeriods[category || 'Hardware'] || 12
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + months)
    return expiryDate.toISOString().split('T')[0]
  }

  // Check if product is already assigned
  const isProductAssigned = (productId: string) => {
    return existingAssignments.some(assignment => 
      assignment.productId === productId && assignment.businessId === business.id
    )
  }

  // Handle assignment
  const handleAssign = async () => {
    // Use the instance's product data when available, otherwise use selectedProduct
    const effectiveProduct = selectedInstance ? selectedInstance.product : selectedProduct
    
    if (!effectiveProduct) {
      alert('Please select a product')
      return
    }

    // Comprehensive debugging
    console.log('Assignment attempt - Detailed Debug:', {
      effectiveProduct: effectiveProduct,
      effectiveProductName: effectiveProduct.name,
      effectiveProductId: effectiveProduct.id,
      effectiveProductIsSerialized: effectiveProduct.isSerialized,
      effectiveProductFull: JSON.stringify(effectiveProduct),
      selectedInstance: selectedInstance,
      selectedInstanceProduct: selectedInstance?.product,
      selectedInstanceProductIsSerialized: selectedInstance?.product?.isSerialized,
      selectedProduct: selectedProduct,
      selectedProductIsSerialized: selectedProduct?.isSerialized,
      hasSelectedInstance: !!selectedInstance
    })

    // Determine if this is a serialized product - multiple fallback strategies
    const isSerializedProduct = effectiveProduct.isSerialized !== undefined 
      ? effectiveProduct.isSerialized
      : selectedInstance?.product?.isSerialized !== undefined
        ? selectedInstance.product.isSerialized
        : selectedProduct?.isSerialized !== undefined
          ? selectedProduct.isSerialized
          : false // Default to non-serialized if undefined

    console.log('Determined isSerialized:', {
      effectiveProductIsSerialized: effectiveProduct.isSerialized,
      selectedInstanceProductIsSerialized: selectedInstance?.product?.isSerialized,
      selectedProductIsSerialized: selectedProduct?.isSerialized,
      finalIsSerialized: isSerializedProduct
    })

    if (isSerializedProduct && !selectedInstance) {
      alert('Please select a serial number for this product')
      return
    }

    // Additional safety check
    if (isSerializedProduct && selectedInstance) {
      // Verify the instance belongs to the selected product
      if (selectedInstance.product.id !== effectiveProduct.id) {
        alert('Serial number mismatch. Please select a valid serial number for this product.')
        return
      }
    }

    setIsAssigning(true)
    try {
      const token = getToken()

      console.log('Starting assignment with:', {
        selectedProduct: effectiveProduct?.name,
        selectedProductIsSerialized: isSerializedProduct,
        selectedInstance: selectedInstance?.serialNumber || selectedInstance?.licenseNumber,
        selectedInstanceProductIsSerialized: selectedInstance?.product?.isSerialized,
        // Check if the product objects match
        productObjectsMatch: effectiveProduct && selectedInstance && 
          effectiveProduct.id === selectedInstance.product.id &&
          isSerializedProduct === (selectedInstance.product?.isSerialized || false)
      })

      const isSerializedAssignment = isSerializedProduct && selectedInstance
      const isNonSerializedAssignment = !isSerializedProduct && !selectedInstance

      console.log('Effective assignment logic:', {
        effectiveProductName: effectiveProduct?.name,
        effectiveProductIsSerialized: isSerializedProduct,
        isSerializedAssignment,
        isNonSerializedAssignment
      })

      if (isSerializedAssignment) {
        console.log('Entering serialized product branch')
        // Assign serialized product instance
        const updateData: any = {
          businessId: business.id,
          contactId: null,
          status,
          comments,
          lastUpdatedBy: currentUser?.id
        }

        if (status === 'sold') {
          updateData.soldDate = new Date().toISOString()
          updateData.warrantyExpiry = warrantyExpiry ? new Date(warrantyExpiry).toISOString() : null
        } else {
          updateData.soldDate = null
          updateData.warrantyExpiry = null
        }

        console.log('Assigning serialized product:', updateData)
        const response = await fetch(`/api/product-instances/${selectedInstance.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to assign serial number')
        }
      } else if (isNonSerializedAssignment) {
        console.log('Entering non-serialized product branch')
        // Assign non-serialized product
        const assignmentData = {
          businessId: business.id,
          productId: effectiveProduct.id,
          quantity,
          status,
          notes: comments || '',
          validFrom: new Date(validFrom).toISOString(),
          validTo: validTo ? new Date(validTo).toISOString() : null,
          assignedBy: currentUser?.id
        }

        console.log('Assigning non-serialized product:', assignmentData)
        const response = await fetch('/api/business-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(assignmentData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to assign product')
        }
      } else {
        console.log('Entering error branch with:', {
          selectedProductIsSerialized: selectedProduct?.isSerialized,
          selectedInstanceProductIsSerialized: selectedInstance?.product?.isSerialized,
          hasSelectedInstance: !!selectedInstance,
          effectiveProductIsSerialized: isSerializedProduct,
          isSerializedAssignment,
          isNonSerializedAssignment,
          isSerializedProduct,
          effectiveProduct: effectiveProduct
        })
        // This should never happen with proper validation, but provide a clear error message
        const errorMsg = isSerializedProduct 
          ? 'Serialized product requires a serial number to be selected.'
          : 'Non-serialized product cannot have a serial number selected.'
        throw new Error(`Invalid assignment state: ${errorMsg}`)
      }

      onAssignmentComplete()
      onClose()
      resetForm()
    } catch (error: any) {
      console.error('Error assigning product:', error)
      alert(`Error: ${error.message || 'Failed to assign product'}`)
    } finally {
      setIsAssigning(false)
    }
  }

  // Get unique categories
  const categories = ['all', ...Array.from(new Set([
    ...products.map(p => p.category),
    ...productInstances.map(i => i.product.category)
  ]))]

  // Group products by category
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  // Group instances by product
  const instancesByProduct = filteredInstances.reduce((acc, instance) => {
    const productKey = `${instance.product.id}-${instance.product.name}`
    if (!acc[productKey]) {
      acc[productKey] = {
        product: instance.product,
        instances: []
      }
    }
    acc[productKey].instances.push(instance)
    return acc
  }, {} as Record<string, { product: ProductInstance['product'], instances: ProductInstance[] }>)

  const getStatusConfig = (statusValue: string) => {
    return statusConfig[statusValue as keyof typeof statusConfig] || statusConfig['in-stock']
  }

  const getStatusOptions = () => {
    // Use the same logic as handleAssign to determine if product is serialized
    const isSerializedProduct = selectedInstance 
      ? selectedInstance.product?.isSerialized || false
      : selectedProduct?.isSerialized || false
    
    return isSerializedProduct ? serializedStatusOptions : nonSerializedStatusOptions
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!w-[95vw] !max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="unified-assignment-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Assign Product to {business.name}
          </DialogTitle>
          <DialogDescription id="unified-assignment-description">
            Select a product to assign to this customer. The system will guide you through the assignment process.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Left: Product Selection */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Available Products</h4>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search all products and serial numbers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40 h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'products' | 'serial-numbers')} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Non-Serialized
                </TabsTrigger>
                <TabsTrigger value="serial-numbers" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Serialized
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products" className="flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto border rounded-lg">
                  {Object.keys(productsByCategory).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                      <Package className="h-8 w-8 mb-2" />
                      <p className="text-sm text-center">
                        {searchTerm || categoryFilter !== 'all' 
                          ? 'No non-serialized products found matching your search. Try the "Serialized" tab for hardware items.'
                          : 'No available non-serialized products in inventory'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                        <div key={category} className="p-3">
                          <div className="flex items-center justify-between mb-2 pb-2 border-b">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-gray-600" />
                              <div>
                                <div className="font-medium text-sm">{category}</div>
                                <div className="text-xs text-gray-500">{categoryProducts.length} available</div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {categoryProducts.length} {categoryProducts.length === 1 ? 'item' : 'items'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            {categoryProducts.map((product) => {
                              // Safety check: ensure no serialized products appear in non-serialized tab
                              if (product.isSerialized) {
                                return null
                              }
                              
                              const isAssigned = isProductAssigned(product.id)
                              const isSelected = selectedProduct?.id === product.id

                              return (
                                <div
                                  key={product.id}
                                  className={`p-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-md ${
                                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                  } ${isAssigned ? 'opacity-60' : ''}`}
                                  onClick={() => !isAssigned && handleProductSelect(product)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <div className="font-medium text-sm">{product.name}</div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                          Non-Serialized
                                        </Badge>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        £{product.price.toFixed(2)} • SKU: {product.sku || 'N/A'}
                                      </div>
                                      {isAssigned && (
                                        <div className="text-xs text-orange-600 mt-1">
                                          Already assigned to this business
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isSelected && (
                                        <CheckCircle className="h-4 w-4 text-blue-600" />
                                      )}
                                      {isAssigned && (
                                        <Badge variant="secondary" className="text-xs">
                                          Assigned
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="serial-numbers" className="flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto border rounded-lg">
                  {Object.keys(instancesByProduct).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                      <Package className="h-8 w-8 mb-2" />
                      <p className="text-sm text-center">
                        {searchTerm || categoryFilter !== 'all' 
                          ? 'No serialized items found matching your search. Try the "Non-Serialized" tab for services and software.'
                          : 'No available serialized items in inventory'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {Object.entries(instancesByProduct).map(([productKey, productData]) => {
                        const { product, instances } = productData
                        
                        return (
                          <div key={productKey} className="p-3">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-600" />
                                <div>
                                  <div className="font-medium text-sm">{product.name}</div>
                                  <div className="text-xs text-gray-500">{product.category} • {instances.length} available</div>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {instances.length} {instances.length === 1 ? 'item' : 'items'}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1">
                              {instances.map((instance) => {
                                const statusInfo = getStatusConfig(instance.status)
                                const StatusIcon = statusInfo.icon
                                const isSelected = selectedInstance?.id === instance.id

                                return (
                                  <div
                                    key={instance.id}
                                    className={`p-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-md ${
                                      isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                    }`}
                                    onClick={() => handleInstanceSelect(instance)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">
                                          {instance.serialNumber || instance.licenseNumber || 'No ID'}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {instance.product.name}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {isSelected && (
                                          <CheckCircle className="h-4 w-4 text-blue-600" />
                                        )}
                                        <Badge className={`text-xs ${statusInfo.color}`}>
                                          {statusInfo.label}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Assignment Details */}
          <div className="flex flex-col">
            <h4 className="font-medium mb-4">Assignment Details</h4>
            
            {selectedProduct ? (
              <div className="space-y-4 flex-1 overflow-y-auto">
                {/* Selected Product Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Selected Product
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{selectedProduct.name}</span>
                      <Badge variant={selectedProduct.isSerialized ? "default" : "secondary"}>
                        {selectedProduct.isSerialized ? "Serialized" : "Non-Serialized"}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      Category: {selectedProduct.category} • Price: £{selectedProduct.price.toFixed(2)}
                    </div>
                    {selectedInstance && (
                      <div className="text-xs text-blue-600">
                        Serial: {selectedInstance.serialNumber || selectedInstance.licenseNumber || 'N/A'}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Assignment Form */}
                <div className="space-y-4">
                  {selectedProduct.isSerialized ? (
                    // Serialized product form
                    <>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {serializedStatusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {status === 'sold' && (
                        <div>
                          <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
                          <Input
                            id="warrantyExpiry"
                            type="date"
                            value={warrantyExpiry}
                            onChange={(e) => setWarrantyExpiry(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="comments">Comments</Label>
                        <Textarea
                          id="comments"
                          placeholder="Add any comments about this assignment..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </>
                  ) : (
                    // Non-serialized product form
                    <>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {nonSerializedStatusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="validFrom">Valid From</Label>
                          <Input
                            id="validFrom"
                            type="date"
                            value={validFrom}
                            onChange={(e) => setValidFrom(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="validTo">Valid To</Label>
                          <Input
                            id="validTo"
                            type="date"
                            value={validTo}
                            onChange={(e) => setValidTo(e.target.value)}
                            min={validFrom}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Add any notes about this assignment..."
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Select a product to continue with assignment</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleAssign} 
                disabled={!selectedProduct || isAssigning || ((selectedInstance?.product?.isSerialized || selectedProduct?.isSerialized) && !selectedInstance)}
                className="flex-1"
              >
                {isAssigning ? 'Assigning...' : 'Assign Product'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}