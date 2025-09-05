'use client'

import { useState, useEffect } from 'react'
import { Calendar, User, Building, Package, Clock, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { getToken } from '@/lib/auth'

interface ProductInstance {
  id: string
  serialNumber: string
  status: string
  businessId?: string
  contactId?: string
  soldDate?: string
  warrantyExpiry?: string
  comments?: string
  product: {
    id: string
    name: string
    category: string
    price: number
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

interface CustomerAssignmentModalProps {
  instance: ProductInstance | null
  open: boolean
  onClose: () => void
  onAssignmentComplete: () => void
}

// Warranty periods for different product categories
const warrantyPeriods: Record<string, number> = {
  'Hardware': 12, // 12 months
  'Software': 6,  // 6 months
  'Services': 3,  // 3 months
  'Support': 12, // 12 months
}

const statusOptions = [
  { value: 'sold', label: 'Sold', description: 'Sold to customer' },
  { value: 'on-car', label: 'On Car', description: 'Installed in vehicle' },
  { value: 'office-use', label: 'Office Use', description: 'Internal company use' },
  { value: 'swapped', label: 'Swapped', description: 'Replaced/Exchanged unit' },
]

export default function CustomerAssignmentModal({ 
  instance, 
  open, 
  onClose, 
  onAssignmentComplete 
}: CustomerAssignmentModalProps) {
  const { user: currentUser } = useAuth()
  const [status, setStatus] = useState<string>('sold')
  const [warrantyExpiry, setWarrantyExpiry] = useState<string>('')
  const [comments, setComments] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [showTransferSection, setShowTransferSection] = useState(false)
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [businesses, setBusinesses] = useState<any[]>([])

  // Reset form when instance changes
  useEffect(() => {
    if (instance) {
      setStatus(instance.status === 'in-stock' ? 'sold' : instance.status)
      setWarrantyExpiry(instance.warrantyExpiry ? 
        new Date(instance.warrantyExpiry).toISOString().split('T')[0] : 
        calculateDefaultWarrantyExpiry(instance.product.category)
      )
      setComments(instance.comments || '')
    }
  }, [instance])

  // Load businesses for transfer dropdown
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const token = getToken()
        const response = await fetch('/api/businesses', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const businessesData = await response.json()
          setBusinesses(businessesData)
        }
      } catch (error) {
        console.error('Error loading businesses:', error)
      }
    }

    if (showTransferSection) {
      loadBusinesses()
    }
  }, [showTransferSection])

  const calculateDefaultWarrantyExpiry = (category?: string) => {
    const months = warrantyPeriods[category || 'Hardware'] || 12
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + months)
    return expiryDate.toISOString().split('T')[0]
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    
    // Auto-calculate warranty expiry for sold items
    if (newStatus === 'sold' && instance && !warrantyExpiry) {
      setWarrantyExpiry(calculateDefaultWarrantyExpiry(instance.product.category))
    }
  }

  const handleCustomerSelect = (businessId: string) => {
    setSelectedBusinessId(businessId)
  }

  const handleTransfer = async () => {
    if (!instance || !selectedBusinessId) {
      alert('Please select a business to transfer to')
      return
    }

    setIsTransferring(true)
    try {
      const token = getToken()
      const updateData: any = {
        businessId: selectedBusinessId,
        contactId: null, // Always null for business-only transfers
        status,
        comments: comments || `Transferred from ${instance.business?.name || 'previous customer'}`,
        lastUpdatedBy: currentUser?.id
      }

      // Set sold date and warranty expiry for sold items
      if (status === 'sold') {
        updateData.soldDate = new Date().toISOString()
        updateData.warrantyExpiry = warrantyExpiry ? new Date(warrantyExpiry).toISOString() : null
      } else {
        // Clear sold date and warranty for non-sold statuses
        updateData.soldDate = null
        updateData.warrantyExpiry = null
      }

      const response = await fetch(`/api/product-instances/${instance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        onAssignmentComplete()
        onClose()
        // Reset transfer state
        setShowTransferSection(false)
        setSelectedBusinessId('')
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to transfer serial number'}`)
      }
    } catch (error) {
      console.error('Error transferring serial number:', error)
      alert('Network error: Failed to transfer serial number')
    } finally {
      setIsTransferring(false)
    }
  }

  const handleAssign = async () => {
    if (!instance) {
      alert('No instance selected')
      return
    }

    setIsAssigning(true)
    try {
      const token = getToken()
      const updateData: any = {
        status,
        comments,
        lastUpdatedBy: currentUser?.id
      }

      // Set sold date and warranty expiry for sold items
      if (status === 'sold') {
        updateData.soldDate = new Date().toISOString()
        updateData.warrantyExpiry = warrantyExpiry ? new Date(warrantyExpiry).toISOString() : null
      } else {
        // Clear sold date and warranty for non-sold statuses
        updateData.soldDate = null
        updateData.warrantyExpiry = null
      }

      const response = await fetch(`/api/product-instances/${instance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        onAssignmentComplete()
        onClose()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to update assignment'}`)
      }
    } catch (error) {
      console.error('Error updating assignment:', error)
      alert('Network error: Failed to update assignment')
    } finally {
      setIsAssigning(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getWarrantyStatus = (expiryDate: string) => {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const monthsUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
    
    if (monthsUntilExpiry < 0) {
      return { status: 'expired', color: 'bg-red-100 text-red-800', text: 'Expired' }
    } else if (monthsUntilExpiry < 3) {
      return { status: 'expiring-soon', color: 'bg-yellow-100 text-yellow-800', text: 'Expiring Soon' }
    } else {
      return { status: 'active', color: 'bg-green-100 text-green-800', text: 'Active' }
    }
  }

  if (!instance) return null

  const warrantyStatus = warrantyExpiry ? getWarrantyStatus(warrantyExpiry) : null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!w-[70vw] !max-w-none max-h-[90vh] overflow-y-auto flex flex-col" aria-describedby="customer-assignment-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Serial Number Assignment
          </DialogTitle>
          <DialogDescription id="customer-assignment-description">
            Modify assignment details for {instance.serialNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Serial Number Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4" />
                Serial Number Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Serial Number</Label>
                  <div className="font-mono text-lg bg-gray-50 p-2 rounded">
                    {instance.serialNumber}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Product</Label>
                  <div className="font-medium">{instance.product.name}</div>
                  <div className="text-sm text-gray-500">{instance.product.category}</div>
                </div>
              </div>
              
              {instance.business && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-blue-900 mb-1">
                        Currently assigned to:
                      </div>
                      <div className="text-blue-800">
                        {instance.business.name}
                        {instance.contact && ` - ${instance.contact.name}`}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTransferSection(!showTransferSection)}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    >
                      <ArrowRight className="mr-1 h-3 w-3" />
                      Transfer
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transfer Section */}
          {showTransferSection && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-orange-800">
                  <ArrowRight className="h-4 w-4" />
                  Transfer to New Business
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-orange-800">Select New Business *</Label>
                  <Select 
                    value={selectedBusinessId || ''} 
                    onValueChange={handleCustomerSelect}
                  >
                    <SelectTrigger>
                      <Building className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2" />
                            {business.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedBusinessId && (
                  <div className="flex justify-end space-x-3 pt-2 border-t border-orange-200">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowTransferSection(false)
                        setSelectedBusinessId('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleTransfer}
                      disabled={isTransferring || !selectedBusinessId}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isTransferring ? 'Transferring...' : 'Transfer Now'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Status *</Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warranty Information (only for sold status) */}
          {status === 'sold' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Warranty Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warrantyExpiry">Warranty Expiry Date</Label>
                    <Input
                      id="warrantyExpiry"
                      type="date"
                      value={warrantyExpiry}
                      onChange={(e) => setWarrantyExpiry(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Warranty Status</Label>
                    {warrantyStatus ? (
                      <Badge className={warrantyStatus.color}>
                        {warrantyStatus.text}
                      </Badge>
                    ) : (
                      <div className="text-sm text-gray-500">Set expiry date</div>
                    )}
                  </div>
                </div>
                
                {warrantyExpiry && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Warranty expires: {formatDate(warrantyExpiry)}
                      </div>
                      {warrantyStatus && (
                        <div className="text-xs">
                          {warrantyStatus.status === 'expired' && 'This warranty has expired'}
                          {warrantyStatus.status === 'expiring-soon' && 'Warranty expires in less than 3 months'}
                          {warrantyStatus.status === 'active' && 'Warranty is active and valid'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Comments / Initials</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter comments, notes, or your initials..."
              rows={3}
            />
            <div className="text-xs text-gray-500">
              Used for tracking who handled this item and any additional notes
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={isAssigning}
            >
              {isAssigning ? 'Updating...' : 'Update Assignment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}