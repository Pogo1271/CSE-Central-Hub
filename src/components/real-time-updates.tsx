'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { Bell, Users, MessageSquare, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

interface RealTimeUpdate {
  id: string
  type: 'user_joined' | 'user_left' | 'business_created' | 'business_updated' | 'quote_created' | 'quote_updated' | 'document_uploaded' | 'task_completed'
  message: string
  user?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  timestamp: Date
  data?: any
}

interface ActiveUser {
  id: string
  name: string
  email: string
  avatar?: string
  lastSeen: Date
}

interface RealTimeUpdatesProps {
  currentUserId?: string
  currentUserName?: string
}

export function RealTimeUpdates({ currentUserId, currentUserName }: RealTimeUpdatesProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [recentUpdates, setRecentUpdates] = useState<RealTimeUpdate[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    // Initialize Socket.IO connection
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to real-time server')
      
      // Join the application room
      newSocket.emit('join', {
        userId: currentUserId,
        userName: currentUserName,
        room: 'business_management'
      })
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from real-time server')
    })

    // Listen for real-time updates
    newSocket.on('user_joined', (data: { user: ActiveUser }) => {
      setActiveUsers(prev => {
        const existing = prev.find(u => u.id === data.user.id)
        if (existing) {
          return prev.map(u => u.id === data.user.id ? { ...data.user, lastSeen: new Date() } : u)
        }
        return [...prev, { ...data.user, lastSeen: new Date() }]
      })

      addUpdate({
        id: Date.now().toString(),
        type: 'user_joined',
        message: `${data.user.name} joined the workspace`,
        user: data.user,
        timestamp: new Date()
      })
    })

    newSocket.on('user_left', (data: { userId: string, userName: string }) => {
      setActiveUsers(prev => prev.filter(u => u.id !== data.userId))
      
      addUpdate({
        id: Date.now().toString(),
        type: 'user_left',
        message: `${data.userName} left the workspace`,
        timestamp: new Date()
      })
    })

    newSocket.on('business_created', (data: { business: any, user: ActiveUser }) => {
      addUpdate({
        id: Date.now().toString(),
        type: 'business_created',
        message: `${data.user.name} created a new business: ${data.business.name}`,
        user: data.user,
        timestamp: new Date(),
        data: data.business
      })
    })

    newSocket.on('business_updated', (data: { business: any, user: ActiveUser }) => {
      addUpdate({
        id: Date.now().toString(),
        type: 'business_updated',
        message: `${data.user.name} updated business: ${data.business.name}`,
        user: data.user,
        timestamp: new Date(),
        data: data.business
      })
    })

    newSocket.on('quote_created', (data: { quote: any, user: ActiveUser }) => {
      addUpdate({
        id: Date.now().toString(),
        type: 'quote_created',
        message: `${data.user.name} created a new quote: ${data.quote.title}`,
        user: data.user,
        timestamp: new Date(),
        data: data.quote
      })
    })

    newSocket.on('quote_updated', (data: { quote: any, user: ActiveUser }) => {
      addUpdate({
        id: Date.now().toString(),
        type: 'quote_updated',
        message: `${data.user.name} updated quote: ${data.quote.title}`,
        user: data.user,
        timestamp: new Date(),
        data: data.quote
      })
    })

    newSocket.on('document_uploaded', (data: { document: any, user: ActiveUser }) => {
      addUpdate({
        id: Date.now().toString(),
        type: 'document_uploaded',
        message: `${data.user.name} uploaded document: ${data.document.name}`,
        user: data.user,
        timestamp: new Date(),
        data: data.document
      })
    })

    newSocket.on('task_completed', (data: { task: any, user: ActiveUser }) => {
      addUpdate({
        id: Date.now().toString(),
        type: 'task_completed',
        message: `${data.user.name} completed task: ${data.task.title}`,
        user: data.user,
        timestamp: new Date(),
        data: data.task
      })
    })

    // Get initial active users
    newSocket.emit('get_active_users')

    newSocket.on('active_users', (users: ActiveUser[]) => {
      setActiveUsers(users.map(u => ({ ...u, lastSeen: new Date(u.lastSeen) })))
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [currentUserId, currentUserName])

  const addUpdate = (update: RealTimeUpdate) => {
    setRecentUpdates(prev => [update, ...prev].slice(0, 50)) // Keep last 50 updates
    setUnreadCount(prev => prev + 1)
  }

  const markAsRead = () => {
    setUnreadCount(0)
  }

  const getUpdateIcon = (type: RealTimeUpdate['type']) => {
    switch (type) {
      case 'user_joined':
        return <Users className="h-4 w-4 text-green-500" />
      case 'user_left':
        return <Users className="h-4 w-4 text-gray-500" />
      case 'business_created':
      case 'business_updated':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'quote_created':
      case 'quote_updated':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'document_uploaded':
        return <FileText className="h-4 w-4 text-orange-500" />
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  // Remove inactive users (more than 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      setActiveUsers(prev => prev.filter(u => new Date(u.lastSeen) > fiveMinutesAgo))
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              Real-time Updates
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            </span>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-xs">
            {isConnected 
              ? 'Receiving live updates from other users' 
              : 'Attempting to connect to real-time server...'
            }
          </CardDescription>
        </CardContent>
      </Card>

      {/* Active Users */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Users ({activeUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{user.name}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Recent Activity
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAsRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-64">
            {recentUpdates.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentUpdates.map((update) => (
                  <div key={update.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                    {getUpdateIcon(update.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {update.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {update.user && (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarImage src={update.user.avatar} />
                              <AvatarFallback className="text-xs">
                                {update.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">{update.user.name}</span>
                          </div>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(update.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}