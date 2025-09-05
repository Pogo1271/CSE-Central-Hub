'use client'

import { useState, useEffect } from 'react'
import { 
  Package, 
  Calendar, 
  Edit,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'
import { getToken } from '@/lib/auth'

interface BusinessProduct {
  id: string
  quantity: number
  status: string
  notes?: string
  validFrom?: string
  validTo?: string
  product: {
    id: string
    name: string
    category: string
    price: number
  }
  business: {
    id: string
    name: string
  }
}

interface BusinessProductEditModalProps {
  businessProduct: BusinessProduct
  open: boolean
  onClose: () => void
  onEditComplete: () => void
}

// Status options for non-serialized products
const statusOptions = [
  { value: 'active', label: 'Active', description: 'Currently assigned and active' },
  { value: 'inactive', label: 'Inactive', description: 'Assigned but not currently active' },
  { value: 'cancelled', label: 'Cancelled', description: 'Assignment has been cancelled' }
]

export default function BusinessProductEditModal({ 
  businessProduct, 
  open, 
  onClose, 
  onEditComplete 
}: BusinessProductEditModalProps) {
  const { user: currentUser } = useAuth()
  const [quantity, setQuantity] = useState<number>(businessProduct.quantity)
  const [status, setStatus] = useState<string>(businessProduct.status)
  const [notes, setNotes] = useState<string>(businessProduct.notes || '')
  const [validFrom, setValidFrom] = useState<string>(
    businessProduct.validFrom ? new Date(businessProduct.validFrom).toISOString().split('T')[0] : ''
  )
  const [validTo, setValidTo] = useState<string>(
    businessProduct.validTo ? new Date(businessProduct.validTo).toISOString().split('T')[0] : ''
  )
  const [isSaving, setIsSaving] = useState(false)

  // Update form values when businessProduct prop changes (when modal opens)
  useEffect(() => {
    if (open) {
      setQuantity(businessProduct.quantity)
      setStatus(businessProduct.status)
      setNotes(businessProduct.notes || '')
      setValidFrom(
        businessProduct.validFrom ? new Date(businessProduct.validFrom).toISOString().split('T')[0] : ''
      )
      setValidTo(
        businessProduct.validTo ? new Date(businessProduct.validTo).toISOString().split('T')[0] : ''
      )
    }
  }, [businessProduct, open])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updateData = {
        quantity,
        status,
        notes: notes || '',
        validFrom: validFrom ? new Date(validFrom).toISOString() : null,
        validTo: validTo ? new Date(validTo).toISOString() : null
      }

      const token = getToken()
      const response = await fetch(`/api/business-products/${businessProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        onEditComplete()
        onClose()
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error || 'Failed to update product assignment'}`)
      }
    } catch (error) {
      console.error('Error updating business product:', error)
      alert('Network error: Failed to update product assignment')
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Product Assignment
          </DialogTitle>
          <DialogDescription id="dialog-description">
            Update the assignment details for {businessProduct.product?.name || 'Unknown Product'}{businessProduct.business ? ` at ${businessProduct.business.name}` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-sm">{businessProduct.product?.name || 'Unknown Product'}</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Category: {businessProduct.product?.category || 'Unknown'}</div>
              <div>Unit Price: £{businessProduct.product?.price?.toFixed(2) || '0.00'}</div>
              <div>Total Value: £{((businessProduct.product?.price || 0) * quantity).toFixed(2)}</div>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
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

          {/* Valid From */}
          <div className="space-y-2">
            <Label htmlFor="validFrom">Valid From</Label>
            <Input
              id="validFrom"
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Valid To */}
          <div className="space-y-2">
            <Label htmlFor="validTo">Valid To (Optional)</Label>
            <Input
              id="validTo"
              type="date"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              min={validFrom}
              className="w-full"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this assignment..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}