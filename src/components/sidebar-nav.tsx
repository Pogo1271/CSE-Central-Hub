'use client'

import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Building2, 
  Users, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  CheckSquare, 
  Settings,
  Package,
  FileSignature,
  FolderOpen,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/#dashboard', icon: Building2, tab: 'dashboard', requiredPermission: 'canViewDashboardPage' },
  { name: 'Business Directory', href: '/#businesses', icon: Building2, tab: 'businesses', requiredPermission: 'canViewBusinessesPage' },
  { name: 'Inventory', href: '/#inventory', icon: Package, tab: 'inventory', requiredPermission: 'canViewInventoryPage' },
  { name: 'Tasks', href: '/#tasks', icon: CheckSquare, tab: 'tasks', requiredPermission: 'canViewTasksPage' },
  { name: 'Users', href: '/#users', icon: Users, tab: 'users', requiredPermission: 'canViewUsersPage' },
  { name: 'Quotes', href: '/#quotes', icon: FileSignature, tab: 'quotes', requiredPermission: 'canViewQuotesPage' },
  { name: 'Documents', href: '/#documents', icon: FolderOpen, tab: 'documents', requiredPermission: 'canViewDocumentsPage' },
  { name: 'Messages', href: '/#messages', icon: MessageSquare, tab: 'messages', requiredPermission: 'canViewMessagesPage' },
  { name: 'Analytics', href: '/#analytics', icon: BarChart3, tab: 'analytics', requiredPermission: 'canViewAnalyticsPage' },
  { name: 'Settings', href: '/#settings', icon: Settings, tab: 'settings', requiredPermission: 'canViewSettingsPage' },
]

interface SidebarNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  rolePermissions?: any
  currentUser?: any
}

// Cache for role permissions
let rolePermissionsCache: any = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function SidebarNav({ activeTab, onTabChange, rolePermissions, currentUser }: SidebarNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [localRolePermissions, setLocalRolePermissions] = useState<any>(null)
  
  // Load role permissions independently and cache them
  useEffect(() => {
    const loadRolePermissions = async () => {
      // Check cache first
      const now = Date.now()
      if (rolePermissionsCache && (now - cacheTimestamp) < CACHE_DURATION) {
        setLocalRolePermissions(rolePermissionsCache)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/roles')
        if (response.ok) {
          const rolesData = await response.json()
          
          // Convert roles array to rolePermissions object
          const dynamicRolePermissions: any = {}
          rolesData.data?.forEach((role: any) => {
            const permissions = role.permissions || {}
            dynamicRolePermissions[role.name] = {
              tabs: ['dashboard', 'businesses', 'inventory', 'tasks', 'users', 'quotes', 'documents', 'messages', 'analytics', 'settings'],
              features: {
                canCreateBusiness: permissions.canCreateBusiness === true,
                canViewAllUsers: permissions.canViewUsers === true,
                canCreateUser: permissions.canCreateUser === true,
                canViewAnalytics: permissions.canViewAnalytics === true,
                canAccessSettings: permissions.canAccessSettings === true,
                canUploadDocument: permissions.canUploadDocument === true,
                canSendMessage: permissions.canSendMessage === true,
                canQuickAddBusiness: permissions.canQuickAddBusiness === true,
                canQuickCreateUser: permissions.canQuickCreateUser === true,
                canQuickUploadDocument: permissions.canQuickUploadDocument === true,
                canQuickSendMessage: permissions.canQuickSendMessage === true,
                canViewDashboardPage: permissions.canViewDashboardPage === true,
                canViewBusinessesPage: permissions.canViewBusinessesPage === true,
                canViewInventoryPage: permissions.canViewInventoryPage === true,
                canViewTasksPage: permissions.canViewTasksPage === true,
                canViewUsersPage: permissions.canViewUsersPage === true,
                canViewQuotesPage: permissions.canViewQuotesPage === true,
                canViewDocumentsPage: permissions.canViewDocumentsPage === true,
                canViewMessagesPage: permissions.canViewMessagesPage === true,
                canViewAnalyticsPage: permissions.canViewAnalyticsPage === true,
                canViewSettingsPage: permissions.canViewSettingsPage === true
              }
            }
          })
          
          // Update cache
          rolePermissionsCache = dynamicRolePermissions
          cacheTimestamp = now
          
          setLocalRolePermissions(dynamicRolePermissions)
        }
      } catch (error) {
        console.error('Failed to load role permissions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRolePermissions()
  }, [])

  // Use passed rolePermissions if available, otherwise use local loaded ones
  const effectiveRolePermissions = rolePermissions || localRolePermissions
  
  const handleTabClick = (tab: string) => {
    onTabChange(tab)
    setIsOpen(false)
  }

  const hasPermission = (permission: string) => {
    if (!effectiveRolePermissions || !currentUser) return false
    
    const userRole = currentUser?.role || 'User'
    const roleData = effectiveRolePermissions[userRole]
    
    return roleData?.features?.[permission] === true
  }

  const NavItems = () => {
    if (isLoading) {
      // Show skeleton loading state
      return (
        <>
          {navigation.map((item) => (
            <div key={item.name} className="flex items-center w-full px-3 py-2">
              <Skeleton className="h-4 w-4 mr-3" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </>
      )
    }

    return (
      <>
        {navigation.map((item) => {
          // Check if user has permission to access this tab
          if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
            return null
          }

          return (
            <button
              key={item.name}
              onClick={() => handleTabClick(item.tab)}
              className={cn(
                'flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === item.tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </button>
          )
        })}
      </>
    )
  }

  return (
    <>
      {/* Mobile Menu */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[300px]">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 space-y-1">
              <NavItems />
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:bg-background md:border-r">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-lg font-semibold">Business Hub</h2>
          </div>
          <nav className="mt-5 flex-1 px-3 space-y-1">
            <NavItems />
          </nav>
        </div>
      </div>
    </>
  )
}