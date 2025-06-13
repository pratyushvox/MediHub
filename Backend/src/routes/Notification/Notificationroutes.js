import express from 'express';
import { 
  getNotifications, 
  getUnreadNotifications, 
  markNotificationAsRead,
  createNotification
} from '../../controllers/Notification/Notificationcontroller.js';

const router = express.Router();

// Route to get all notifications for a specific recipient
router.get('/:role/:recipientId', getNotifications);

// Route to get only unread notifications
router.get('/unread/:role/:recipientId', getUnreadNotifications);

// Route to mark a notification as read
router.patch('/mark-as-read/:notificationId', markNotificationAsRead);

// Route to create and send a notification
router.post('/create', createNotification);

export default router;
