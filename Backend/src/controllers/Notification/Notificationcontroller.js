import Notification from '../../models/Notification/Notificationmodel.js';
import { getIO } from '../../../src/Utils/IO.js';

// 🔔 Send notification and save it
export const sendNotification = async (recipientId, message, role) => {
  const io = getIO();
  if (!io) {
    console.error('[Notification] Socket.io not initialized');
    return;
  }

  try {
    console.log(`[DEBUG] Starting sendNotification for ${recipientId} with role ${role}`);
    console.log(`[Notification] Sending to recipient: ${recipientId}, role: ${role}`);
    console.log(`[Notification] Message: ${message}`);
    
    const newNotification = new Notification({
      message: message.trim(),
      recipient: { 
        id: recipientId, 
        role 
      },
      read: false // 🔼 Explicitly set to false
    });

    const savedNotification = await newNotification.save();
    console.log(`[Notification] Saved to database with ID: ${savedNotification._id}`);

    // Emit to the correct room format
    const roomName = `${role}:${recipientId}`;
    io.to(roomName).emit('notification', {
      recipientId,
      role,
      message: newNotification.message,
      timestamp: newNotification.createdAt,
      id: newNotification._id,
    });

    console.log(`[Notification] Emitted to room ${roomName}`);
    return savedNotification;
  } catch (error) {
    console.error('[Notification] Detailed error:', error.stack);
    throw error;
  }
};

// 📩 API to trigger a notification
export const createNotification = async (req, res) => {
  const io = getIO();
  if (!io) console.error('[Notification API] Socket.io not initialized');

  try {
    const { recipient, message } = req.body;

    if (!recipient || !recipient.id || !recipient.role || !message) {
      return res.status(400).json({
        success: false,
        message: 'recipient.id, recipient.role, and message are required'
      });
    }

    const newNotification = new Notification({
      message: message.trim(),
      recipient: {
        id: recipient.id,
        role: recipient.role
      },
      read: false
    });

    const savedNotification = await newNotification.save();
    const roomName = `${recipient.role}:${recipient.id}`;
    console.log(`[Notification API] Emitting to room: ${roomName}`);
    io.to(roomName).emit('notification', {
      recipientId: recipient.id,
      role: recipient.role,
      message: savedNotification.message,
      timestamp: savedNotification.createdAt,
      id: savedNotification._id
    });

    res.json({
      success: true,
      message: 'Notification sent successfully',
      notification: savedNotification
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

    console.log("Fetching notifications for:", role, recipientId);
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
      .sort({ createdAt: -1 })
      .exec();

    console.log(`[Notifications] Found ${notifications.length} notifications for ${role}:${recipientId}`);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('[Notifications] Error fetching notifications:', error.message);
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: error.message });
  }
};

// 📥 Get unread notifications
export const getUnreadNotifications = async (req, res) => {
  try {
    const { recipientId, role } = req.params;
    
    console.log(`[Unread] Fetching unread for ${role}:${recipientId}`);

    const unreadNotifications = await Notification.find({ 
      "recipient.id": recipientId, 
      "recipient.role": role, 
      read: false 
    }).sort({ createdAt: -1 });

    console.log(`[Unread] Found ${unreadNotifications.length} unread notifications`);
    res.json({ success: true, unreadNotifications });
  } catch (error) {
    console.error('[Unread] Error fetching unread notifications:', error.stack);
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

// Mark all notifications as read for a recipient
export const markAllAsRead = async (req, res) => {
  try {
    const { recipientId, role } = req.params;
    
    const result = await Notification.updateMany(
      { 
        "recipient.id": recipientId, 
        "recipient.role": role,
        read: false
      },
      { $set: { read: true } }
    );
    
    res.json({ 
      success: true, 
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('[Notification] Error marking all as read:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error marking all notifications as read', 
      error: error.message 
    });
  }
};

// Delete all notifications for a recipient
export const deleteAllNotifications = async (req, res) => {
  try {
    const { recipientId, role } = req.params;
    
    const result = await Notification.deleteMany({
      "recipient.id": recipientId,
      "recipient.role": role
    });
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} notifications`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('[Notification] Error deleting notifications:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error deleting notifications',
      error: error.message
    });
  }
};
