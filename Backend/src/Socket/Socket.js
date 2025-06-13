import { setIO } from '../../src/Utils/IO.js';

export const setupSocket = (io) => {
  // initialize shared IO instance
  setIO(io);

  io.on('connection', (socket) => {
    console.log(`⚡ [Socket] Client connected: ${socket.id}`);

    socket.on('join', ({ role, userId }) => {
      // 🔼 Validate allowed roles
      const allowedRoles = ['admin', 'doctor', 'patient'];
      console.log(`[DEBUG] User attempting to join: role=${role}, userId=${userId}`);
      
      if (!allowedRoles.includes(role)) {
        console.log(`❌ [Socket] Invalid role: ${role}`);
        return socket.disconnect(true);
      }
      
      if (!userId) {
        console.log(`❌ [Socket] Missing userId for role: ${role}`);
        return;
      }
      
      const roomName = `${role}:${userId}`;
      socket.join(roomName);
      console.log(`✅ [Socket] Joined room: ${roomName}`);
      
      // Confirm room join to client
      socket.emit('roomJoined', { role, userId, roomName });
    });

    socket.on('disconnect', () => {
      console.log(`❌ [Socket] Client disconnected: ${socket.id}`);
    });
  });
};
