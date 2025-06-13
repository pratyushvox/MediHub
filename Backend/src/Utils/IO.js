
let ioInstance = null;

/**
 * Initialize the shared Socket.IO instance.
 * Call this once in server.js or socket.js on server startup.
 */
export const setIO = (io) => {
  ioInstance = io;
};

/**
 * Retrieve the shared Socket.IO instance.
 * Import and call this in any controller or module that needs to emit events.
 */
export const getIO = () => {
  if (!ioInstance) console.error('[IO] Socket.IO instance not initialized.');
  return ioInstance;
};