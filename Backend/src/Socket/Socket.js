import { setIO } from '../controllers/Notification/Notificationcontroller.js';

// Update the room emission logic
export const setupSocket = (io) => {
    setIO(io);
    
    io.on('connection', (socket) => {
      console.log(`⚡ [Socket] Client connected: ${socket.id}`);
      
      socket.on('join', ({ role, userId }) => {
        // 🔼 Validate allowed roles
        const allowedRoles = ['admin', 'doctor', 'patient'];
        if (!allowedRoles.includes(role)) {
          console.log(`Invalid role attempted: ${role}`);
          return socket.disconnect(true); // Force disconnect
        }
      
        if (role && userId) {
          const roomName = `${role}:${userId}`;
          socket.join(roomName);
          console.log(`Joined room: ${roomName}`);
        }
      });
      
      socket.on('disconnect', () => {
        console.log(`❌ [Socket] Client disconnected: ${socket.id}`);
      });
    });
  };
