import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { baseUrl } from '../Constant/Constant';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);


export const NotificationProvider = ({ children, overrideRole, overrideId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Prevent repeated fetch in StrictMode or re-renders
  const hasFetched = useRef(false);
  // Ensure single socket connection
  const socketRef = useRef(null);

  // Determine userData from overrides or localStorage
  const getUserData = () => {
    if (overrideRole && overrideId) {
      return { role: overrideRole, id: overrideId };
    }
    try {
      const userId = localStorage.getItem('UserId');
      const doctorId = localStorage.getItem('doctorId');
      const adminId = localStorage.getItem('adminId');
      if (doctorId) return { id: doctorId, role: 'doctor' };
      if (userId) return { id: userId, role: 'patient' };
      if (adminId) return { id: adminId, role: 'admin' };
      return null;
    } catch (err) {
      console.error('Error getting user data:', err);
      return null;
    }
  };

  // Fetch persisted notifications once
  useEffect(() => {
    const userData = getUserData();
    if (!userData) {
      setIsLoading(false);
      return;
    }
    if (hasFetched.current) {
      setIsLoading(false);
      return;
    }
    hasFetched.current = true;

    (async () => {
      try {
        const res = await fetch(
          `${baseUrl}notifications/${userData.role}/${userData.id}`
        );
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const result = await res.json();
        if (result.success) {
          const formatted = result.notifications.map(n => ({
            id: n._id,
            message: n.message,
            timestamp: n.createdAt,
            read: n.read,
          }));
          setNotifications(formatted);
          setUnreadCount(formatted.filter(n => !n.read).length);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        toast.error('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [overrideRole, overrideId]);

  // Real-time socket setup (once)
  useEffect(() => {
    const userData = getUserData();
    if (!userData || socketRef.current) return;

    const socket = io('http://localhost:4000');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join', { role: userData.role, userId: userData.id });
    });

    socket.on('notification', data => {
      const recipientId = data.recipientId || data.recipient?.id;
      if (recipientId !== userData.id) return;

      const id = data.id || data._id;
      const timestamp = data.timestamp || data.createdAt || Date.now();
      const message = data.message;
      const newNoti = { id, message, read: false, timestamp };

      setNotifications(prev => [newNoti, ...prev]);
      setUnreadCount(c => c + 1);
      toast.info(message);
    });

    return () => {
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [overrideRole, overrideId]);

  // Mark a single notification as read
//   const markAsRead = async notificationId => {
//     try {
//       const res = await fetch(
//         `${baseUrl}notifications/mark-as-read/${notificationId}`,
//         { method: 'PATCH' }
//       );
//       if (!res.ok) throw new Error('Failed to mark notification as read');
//       const result = await res.json();
//       if (result.success) {
//         setNotifications(prev =>
//           prev.map(n =>
//             n.id === notificationId ? { ...n, read: true } : n
//           )
//         );
//         setUnreadCount(c => Math.max(0, c - 1));
//       }
//     } catch (err) {
//       console.error('Error marking as read:', err);
//       toast.error('Failed to update notification');
//     }
//   };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(
        unread.map(n =>
          fetch(
            `${baseUrl}notifications/mark-as-read/${n.id}`,
            { method: 'PATCH' }
          )
        )
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to update notifications');
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await markAllAsRead();
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (err) {
      console.error('Error clearing notifications:', err);
      toast.error('Failed to clear notifications');
    }
  };

  // Update unreadCount when notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      setUnreadCount(notifications.filter(n => !n.read).length);
    } else {
      setUnreadCount(0);
    }
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    // markAsRead,
    markAllAsRead,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
