import Notification from '../../models/Notification/Notificationmodel.js';

// Socket.io instance
let ioInstance = null;
export const setIO = (io) => {
  ioInstance = io;
};

// 🔔 Send notification and save it
// Update the sendNotification function
export const sendNotification = async (recipientId, message, role) => {
    if (!ioInstance) {
      console.error('[Notification] Socket.io not initialized');
      return;
    }
  
    try {
      console.log(`[Notification] Sending to recipient: ${recipientId}, role: ${role}`);
      console.log(`[Notification] Message: ${message}`);
        const newNotification = new Notification({
            message: message.trim(),
            recipient: { id: recipientId, role },
            read: false // 🔼 Explicitly set to false
          });
  
      await newNotification.save();
  
      // Emit to the correct room format
      const roomName = `${role}:${recipientId}`;
      ioInstance.to(roomName).emit('notification', { // Changed this line
        recipientId,
        role,
        message: newNotification.message,
        timestamp: newNotification.createdAt,
        id: newNotification._id,
      });
  
      console.log(`[Notification] Emitted to room ${roomName}`);
      return newNotification;
    } catch (error) {
      console.error('[Notification] Error:', error);
      throw error;
    }
  };
  
// 📩 API to trigger a notification
export const createNotification = async (req, res) => {
    try {
      const { recipient, message } = req.body;
  
      // Ensure all required data is present
      if (!recipient || !recipient.id || !recipient.role || !message) {
        return res.status(400).json({
          success: false,
          message: 'recipient.id, recipient.role, and message are required'
        });
      }
  
      // Create a new notification instance
      const newNotification = new Notification({
        message: message.trim(),
        recipient: {
          id: recipient.id,
          role: recipient.role
        }
      });
  
      // Save the notification to the database
      await newNotification.save();
  
      // Emit the notification to the user's room (by their id)
      const roomName = `${recipient.role}:${recipient.id}`; // Add this line
ioInstance.to(roomName).emit('notification', {       // Replace recipient.id with roomName
  recipientId: recipient.id,
  role: recipient.role,
  message: newNotification.message,
  timestamp: newNotification.createdAt,
  id: newNotification._id
});
      // Respond with a success message and notification data
      res.json({
        success: true,
        message: 'Notification sent successfully',
        notification: newNotification
      });
    } catch (error) {
      console.error('[Notification] Error creating notification:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error sending notification',
        error: error.message
      });
    }
  };
  
// 🧾 Get all notifications for a user (by ID and role)
export const getNotifications = async (req, res) => {
    try {
      const { role, recipientId } = req.params;
  
      console.log("Fetching notifications for:", role, recipientId);  // Debugging log
      if (!role || !recipientId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing role or recipientId in parameters' 
        });
      }
  
      const notifications = await Notification.find({
        "recipient.id": recipientId,
        "recipient.role": role
      })
        .sort({ createdAt: -1 })  // Sorting by the latest notification
        .exec();
  
      res.json({ success: true, notifications });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
    }
  };
  

// 📥 Get unread notifications
export const getUnreadNotifications = async (req, res) => {
  try {
    const { recipientId, role } = req.params;

    const unreadNotifications = await Notification.find({ recipient: recipientId, role, read: false })
      .sort({ createdAt: -1 });

    res.json({ success: true, unreadNotifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching unread notifications', error: error.message });
  }
};

// ✅ Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking notification as read', error: error.message });
  }
};
export const clearAllNotifications = async () => {
    try {
      // First mark them all as read
      await markAllAsRead();
      
      // Then clear the list (optional - only if you want to remove them completely)
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error('Failed to clear notifications');
    }
  };