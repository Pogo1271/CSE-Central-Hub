'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface FilterOption {
  id: string
  label: string
  type: 'text' | 'select' | 'date' | 'checkbox'
  options?: string[]
  value?: any
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, any>) => void
  onReset: () => void
  filterOptions: FilterOption[]
  placeholder?: string
  className?: string
}

export function AdvancedSearch({ 
  onSearch, 
  onReset, 
  filterOptions, 
  placeholder = "Search...",
  className = "" 
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState<Record<string, any>>({})

  // Apply search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchQuery, activeFilters)
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchQuery, activeFilters, onSearch])

  const handleFilterChange = (filterId: string, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [filterId]: value
    }))
  }

  const applyFilters = () => {
    setActiveFilters(tempFilters)
    setIsFilterDialogOpen(false)
  }

  const clearFilter = (filterId: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[filterId]
    setActiveFilters(newFilters)
    setTempFilters(newFilters)
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setTempFilters({})
    setSearchQuery('')
    onReset()
  }

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => activeFilters[key] !== undefined && activeFilters[key] !== '').length
  }

  const getFilterDisplayValue = (filter: FilterOption) => {
    const value = activeFilters[filter.id]
    if (value === undefined || value === '') return null
    
    if (filter.type === 'checkbox') {
      return value ? filter.label : null
    }
    
    if (filter.type === 'select' && filter.options) {
      const option = filter.options.find(opt => opt === value)
      return option ? `${filter.label}: ${option}` : null
    }
    
    return `${filter.label}: ${value}`
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Filter Button */}
          <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 ${getActiveFilterCount() > 0 ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <Filter className="h-4 w-4" />
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Advanced Filters</DialogTitle>
                <DialogDescription>
                  Configure filters to narrow down your search results.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {filterOptions.map((filter) => (
                  <div key={filter.id} className="space-y-2">
                    <Label htmlFor={filter.id}>{filter.label}</Label>
                    {filter.type === 'text' && (
                      <Input
                        id={filter.id}
                        value={tempFilters[filter.id] || ''}
                        onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        placeholder={`Enter ${filter.label.toLowerCase()}`}
                      />
                    )}
                    {filter.type === 'select' && filter.options && (
                      <Select 
                        value={tempFilters[filter.id] || ''} 
                        onValueChange={(value) => handleFilterChange(filter.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {filter.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {filter.type === 'checkbox' && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={filter.id}
                          checked={tempFilters[filter.id] || false}
                          onCheckedChange={(checked) => handleFilterChange(filter.id, checked)}
                        />
                        <Label htmlFor={filter.id} className="text-sm">
                          {filter.label}
                        </Label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setTempFilters({})}>
                  Clear Filters
                </Button>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => setIsFilterDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Reset Button */}
          {(searchQuery || getActiveFilterCount() > 0) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              onClick={clearAllFilters}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((filter) => {
            const displayValue = getFilterDisplayValue(filter)
            if (!displayValue) return null
            
            return (
              <Badge key={filter.id} variant="secondary" className="flex items-center gap-1">
                {displayValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => clearFilter(filter.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}