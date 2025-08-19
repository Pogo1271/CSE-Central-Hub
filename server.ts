// server.ts - Next.js Standalone + Socket.IO
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const currentPort = parseInt(process.env.PORT || '3000', 10);
const serverHostname = '0.0.0.0'; // Bind to all interfaces
const displayHostname = 'localhost'; // Show localhost in console

// Custom server with Socket.IO integration
async function createCustomServer() {
  try {
    console.log('Starting Next.js app...');
    
    // Create Next.js app - use display hostname for Next.js config
    const nextApp = next({ 
      dev,
      dir: process.cwd(),
      hostname: displayHostname,
      port: currentPort
    });

    await nextApp.prepare();
    console.log('Next.js app prepared');
    
    const handle = nextApp.getRequestHandler();

    // Create HTTP server that will handle both Next.js and Socket.IO
    const server = createServer(async (req, res) => {
      try {
        // Skip socket.io requests from Next.js handler
        if (req.url?.startsWith('/api/socketio')) {
          return;
        }
        
        // Handle Next.js requests
        await handle(req, res);
      } catch (err) {
        console.error('Error handling request:', err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      }
    });

    // Setup Socket.IO
    const io = new Server(server, {
      path: '/api/socketio',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    setupSocket(io);

    // Start the server with error handling for port conflicts
    server.listen(currentPort, serverHostname, () => {
      console.log(`> Ready on http://${displayHostname}:${currentPort}`);
      console.log(`> Socket.IO server running at ws://${displayHostname}:${currentPort}/api/socketio`);
      console.log(`> Server bound to ${serverHostname}:${currentPort}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${currentPort} is already in use. Please:`);
        console.error('1. Kill the process using this port, or');
        console.error('2. Use a different port by setting PORT environment variable');
        console.error(`Example: PORT=3001 npm run dev`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });

  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
}

// Start the server
createCustomServer();
