import React, { useState } from 'react';
import { FaBell, FaUserCircle, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DoctorProfile from '../Page/Doctor/Doctorprofile';
import Editdocprofile from '../Page/Doctor/Editdocprofile';
import Notifications from '../Component/Notification';
import { NotificationProvider, useNotifications } from '../Context/Notificationcontext';

const NotificationBadge = () => {
  const { unreadCount } = useNotifications();
  return unreadCount > 0 ? (
    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
      <span className="text-white text-xs">{unreadCount}</span>
    </div>
  ) : null;
};

const DoctorNavbar = ({ doctorData, onRefresh }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const doctorId = localStorage.getItem('doctorId');

  // Toggle functions
  const toggleProfileModal = () => setShowProfileModal(!showProfileModal);
  const toggleUserPopup = () => {
    setShowUserPopup(!showUserPopup);
    if (showNotifications) setShowNotifications(false);
  };
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showUserPopup) setShowUserPopup(false);
  };
  const handleShowEditProfile = () => {
    setShowEditProfile(true);
    setShowUserPopup(false);
  };
  const handleCloseEditProfile = () => setShowEditProfile(false);
  const handleLogout = () => {
    localStorage.removeItem('doctorId');
    navigate('/doctor/login');
  };

  // Click outside handler
  const handleClickOutside = (event) => {
    if (!event.target.closest('.notification-container') && showNotifications) {
      setShowNotifications(false);
    }
    if (!event.target.closest('.user-popup-container') && showUserPopup) {
      setShowUserPopup(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showUserPopup]);

  return (
    <>
      <nav className="flex justify-between items-center p-4 bg-white shadow-md relative">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-600">Welcome Dr. {doctorData?.name || 'User'}</h1>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification Bell with Badge */}
          <div className="relative notification-container">
            <div className="relative">
              <FaBell 
                className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300" 
                onClick={toggleNotifications}
              />
              <NotificationProvider overrideRole="doctor" overrideId={doctorId}>
                <NotificationBadge />
              </NotificationProvider>
            </div>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                <NotificationProvider overrideRole="doctor" overrideId={doctorId}>
                  <Notifications />
                </NotificationProvider>
              </div>
            )}
          </div>

          {/* Doctor Profile Button - Shows name and specialty */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-lg"
            onClick={toggleProfileModal}
          >
            <img
              src={doctorData?.profilePic || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop"}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-gray-700">Dr. {doctorData?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{doctorData?.specialist || 'Specialist'}</p>
            </div>
          </div>

          {/* Settings Dropdown */}
          <div className="relative user-popup-container">
            <FaCog
              className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300"
              onClick={toggleUserPopup}
            />
            {showUserPopup && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                <div className="flex flex-col gap-2 p-2">
                  <button 
                    className="text-left hover:bg-gray-100 p-2 rounded text-sm"
                    onClick={handleShowEditProfile}
                  >
                    Edit Profile
                  </button>
                  <button
                    className="text-left hover:bg-gray-100 p-2 rounded text-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Doctor Profile Modal - Updated to pass onClose prop correctly */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Doctor Profile</h2>
              <button
                onClick={toggleProfileModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <DoctorProfile onClose={toggleProfileModal} />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative">
            <button
              onClick={handleCloseEditProfile}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <Editdocprofile onClose={handleCloseEditProfile} onUpdate={onRefresh} />
          </div>
        </div>
      )}
    </>
  );
};

export default DoctorNavbar;