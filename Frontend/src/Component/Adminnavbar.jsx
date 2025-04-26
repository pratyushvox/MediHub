import React, { useState, useEffect } from 'react';
import { FaBell, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Notifications from '../Component/Notification';
import { NotificationProvider, useNotifications } from '../Context/Notificationcontext';

// Badge to show unread count
const NotificationBadge = () => {
  const { unreadCount } = useNotifications();
  return unreadCount > 0 ? (
    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
      <span className="text-white text-xs">{unreadCount}</span>
    </div>
  ) : null;
};

const AdminNavbar = ({ pageTitle = "admin panel"}  ) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const adminId = localStorage.getItem('adminId');

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showSettings) setShowSettings(false);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    if (showNotifications) setShowNotifications(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminId');
    navigate('/admin/login');
  };

  // close popovers if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notif-container') && showNotifications) {
        setShowNotifications(false);
      }
      if (!e.target.closest('.settings-container') && showSettings) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showSettings]);

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md relative">
    <h1 className="text-xl font-semibold text-gray-600">{pageTitle}</h1>
    

      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative notif-container">
          <FaBell
            className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300"
            onClick={toggleNotifications}
          />
          <NotificationProvider overrideRole="admin" overrideId={adminId}>
            <NotificationBadge />
          </NotificationProvider>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
              <NotificationProvider overrideRole="admin" overrideId={adminId}>
                <Notifications />
              </NotificationProvider>
            </div>
          )}
        </div>

        {/* Settings Dropdown */}
        <div className="relative settings-container">
          <FaCog
            className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300"
            onClick={toggleSettings}
          />
          {showSettings && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full text-left hover:bg-gray-100 p-2 rounded text-sm"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
