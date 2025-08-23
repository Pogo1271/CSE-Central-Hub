'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
}

export function SidebarNav({ activeTab, onTabChange, rolePermissions }: SidebarNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleTabClick = (tab: string) => {
    onTabChange(tab)
    setIsOpen(false)
  }

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        // Check if user has permission to access this tab
        if (item.requiredPermission && rolePermissions) {
          const userRole = rolePermissions[rolePermissions.currentUser?.role || 'User']
          
          // SuperUser has access to everything
          if (rolePermissions.currentUser?.role === 'SuperUser') {
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
          }
          
          if (!userRole?.features?.[item.requiredPermission]) {
            return null
          }
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