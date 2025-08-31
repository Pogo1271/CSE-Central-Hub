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