import { Server } from 'socket.io'
import { db } from '@/lib/db'

interface ActiveUser {
  id: string
  name: string
  email: string
  avatar?: string
  lastSeen: Date
}

const activeUsers = new Map<string, ActiveUser>()

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Handle user joining
    socket.on('join', async (data: { userId: string; userName: string; email?: string; avatar?: string; room: string }) => {
      try {
        const { userId, userName, email, avatar, room } = data
        
        // Add user to active users
        const activeUser: ActiveUser = {
          id: userId,
          name: userName,
          email: email || '',
          avatar,
          lastSeen: new Date()
        }
        
        activeUsers.set(userId, activeUser)
        socket.join(room)
        socket.userId = userId
        socket.userName = userName

        // Notify others in the room
        socket.to(room).emit('user_joined', { user: activeUser })

        // Send current active users to the newly joined user
        const allActiveUsers = Array.from(activeUsers.values())
        socket.emit('active_users', allActiveUsers)

        console.log(`${userName} joined room: ${room}`)
      } catch (error) {
        console.error('Error handling join:', error)
      }
    })

    // Handle getting active users
    socket.on('get_active_users', () => {
      const allActiveUsers = Array.from(activeUsers.values())
      socket.emit('active_users', allActiveUsers)
    })

    // Handle business creation
    socket.on('business_created', (data: { business: any; user: ActiveUser }) => {
      try {
        const room = Array.from(socket.rooms).find(r => r !== socket.id)
        if (room) {
          socket.to(room).emit('business_created', data)
        }
      } catch (error) {
        console.error('Error handling business_created:', error)
      }
    })

    // Handle business update
    socket.on('business_updated', (data: { business: any; user: ActiveUser }) => {
      try {
        const room = Array.from(socket.rooms).find(r => r !== socket.id)
        if (room) {
          socket.to(room).emit('business_updated', data)
        }
      } catch (error) {
        console.error('Error handling business_updated:', error)
      }
    })

    // Handle quote creation
    socket.on('quote_created', (data: { quote: any; user: ActiveUser }) => {
      try {
        const room = Array.from(socket.rooms).find(r => r !== socket.id)
        if (room) {
          socket.to(room).emit('quote_created', data)
        }
      } catch (error) {
        console.error('Error handling quote_created:', error)
      }
    })

    // Handle quote update
    socket.on('quote_updated', (data: { quote: any; user: ActiveUser }) => {
      try {
        const room = Array.from(socket.rooms).find(r => r !== socket.id)
        if (room) {
          socket.to(room).emit('quote_updated', data)
        }
      } catch (error) {
        console.error('Error handling quote_updated:', error)
      }
    })

    // Handle document upload
    socket.on('document_uploaded', (data: { document: any; user: ActiveUser }) => {
      try {
        const room = Array.from(socket.rooms).find(r => r !== socket.id)
        if (room) {
          socket.to(room).emit('document_uploaded', data)
        }
      } catch (error) {
        console.error('Error handling document_uploaded:', error)
      }
    })

    // Handle task completion
    socket.on('task_completed', (data: { task: any; user: ActiveUser }) => {
      try {
        const room = Array.from(socket.rooms).find(r => r !== socket.id)
        if (room) {
          socket.to(room).emit('task_completed', data)
        }
      } catch (error) {
        console.error('Error handling task_completed:', error)
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      try {
        const userId = socket.userId
        const userName = socket.userName
        
        if (userId && userName) {
          // Remove from active users
          activeUsers.delete(userId)
          
          // Notify others in the room
          const rooms = Array.from(socket.rooms).filter(r => r !== socket.id)
          rooms.forEach(room => {
            socket.to(room).emit('user_left', { userId, userName })
          })
          
          console.log(`${userName} disconnected`)
        }
      } catch (error) {
        console.error('Error handling disconnect:', error)
      }
    })

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to the Business Management System!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    })
  })

  // Clean up inactive users periodically
  setInterval(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    for (const [userId, user] of activeUsers.entries()) {
      if (user.lastSeen < fiveMinutesAgo) {
        activeUsers.delete(userId)
      }
    }
  }, 60000) // Clean up every minute
}

// Helper function to broadcast real-time updates
export const broadcastUpdate = (io: Server, event: string, data: any, room: string = 'business_management') => {
  io.to(room).emit(event, data)
}