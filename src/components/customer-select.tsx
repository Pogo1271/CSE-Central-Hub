'use client'

import { useState, useEffect } from 'react'
import { Building, User, Phone, Mail } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface CustomerSelectProps {
  onCustomerSelect: (businessId: string, contactId?: string) => void
  selectedBusinessId?: string
  selectedContactId?: string
  disabled?: boolean
}

interface Business {
  id: string
  name: string
  contacts?: Contact[]
}

interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
}

export default function CustomerSelect({ 
  onCustomerSelect, 
  selectedBusinessId, 
  selectedContactId,
  disabled = false 
}: CustomerSelectProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(false)

  // Load businesses from API
  useEffect(() => {
    const loadBusinesses = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/businesses')
        if (response.ok) {
          const businessesData = await response.json()
          setBusinesses(businessesData)
          
          // Set selected business if provided
          if (selectedBusinessId) {
            const business = businessesData.find((b: Business) => b.id === selectedBusinessId)
            setSelectedBusiness(business || null)
          }
        }
      } catch (error) {
        console.error('Error loading businesses:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBusinesses()
  }, [selectedBusinessId])

  const handleBusinessChange = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId)
    setSelectedBusiness(business || null)
    
    // Auto-select first contact if available, otherwise just business
    if (business && business.contacts && business.contacts.length > 0) {
      onCustomerSelect(businessId, business.contacts[0].id)
    } else {
      onCustomerSelect(businessId)
    }
  }

  const handleContactChange = (contactId: string) => {
    if (selectedBusiness) {
      // If "business-only" is selected, pass undefined as contactId
      if (contactId === 'business-only') {
        onCustomerSelect(selectedBusiness.id)
      } else {
        onCustomerSelect(selectedBusiness.id, contactId)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">Select Customer</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading businesses..." />
          </SelectTrigger>
        </Select>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Business *</Label>
        <Select 
          value={selectedBusinessId || ''} 
          onValueChange={handleBusinessChange}
          disabled={disabled}
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

      {selectedBusiness && selectedBusiness.contacts && selectedBusiness.contacts.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Contact (Optional)</Label>
          <Select 
            value={selectedContactId || ''} 
            onValueChange={handleContactChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select a contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business-only">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Assign to business only
                </div>
              </SelectItem>
              {selectedBusiness.contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {contact.name}
                    </div>
                    {contact.email && (
                      <div className="text-xs text-gray-500 ml-6 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="text-xs text-gray-500 ml-6 flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}