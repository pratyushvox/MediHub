import React, { useState } from 'react';
import { FaCreditCard, FaBell, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PatientProfile from '../Page/Patient/Patientprofile';
import EditPatientProfile from '../page/Patient/Editprofile';
import Notifications from './Notification';
import { NotificationProvider, useNotifications } from '../Context/Notificationcontext';

const NotificationBadge = () => {
  const { unreadCount } = useNotifications();
  return unreadCount > 0 ? (
    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
      <span className="text-white text-xs">{unreadCount}</span>
    </div>
  ) : null;
};

const PatientNavbar = ({ pageTitle }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const patientId = localStorage.getItem('Userid');

  const toggleProfilePopup = () => {
    setShowProfile(!showProfile);
  };

  const toggleUserPopup = () => {
    setShowUserPopup(!showUserPopup);
    // Close notifications if open
    if (showNotifications) setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    // Close user popup if open
    if (showUserPopup) setShowUserPopup(false);
  };

  const handleLogout = () => {
  // Clear the authentication data from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('Userid');
  
  // Navigate to login page
  navigate('/login');
};

  const handleShowEditProfile = () => {
    setShowEditProfile(true);
    setShowUserPopup(false);
  };

  const handleCloseEditProfile = () => {
    setShowEditProfile(false);
  };

  // Close popups when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.notification-container') && showNotifications) {
      setShowNotifications(false);
    }
    if (!event.target.closest('.user-popup-container') && showUserPopup) {
      setShowUserPopup(false);
    }
  };

  // Add click outside listener
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, showUserPopup]);

  return (
    <>
      <nav className="flex justify-between items-center p-4 bg-white shadow-md relative">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-600">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-6">
          <FaCreditCard
            className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300"
            onClick={toggleProfilePopup}
          />
          
          <div className="relative notification-container">
            <div className="relative">
              <FaBell 
                className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300" 
                onClick={toggleNotifications}
              />
              <NotificationProvider overrideRole="patient" overrideId={patientId}>
                <NotificationBadge />
              </NotificationProvider>
            </div>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                <NotificationProvider overrideRole="patient" overrideId={patientId}>
                  <Notifications />
                </NotificationProvider>
              </div>
            )}
          </div>

          <div className="relative user-popup-container">
            <FaUserCircle
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

      {/* Patient Profile Popup */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Patient Profile</h2>
              <button
                onClick={toggleProfilePopup}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <PatientProfile />
          </div>
        </div>
      )}

      {/* Edit Profile Popup */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <button
            onClick={handleCloseEditProfile}
            className="text-gray-500 hover:text-gray-700 absolute top-4 right-4 z-50"
          >
            ✕
          </button>
          <EditPatientProfile onClose={handleCloseEditProfile} />
        </div>
      )}
    </>
  );
};

export default PatientNavbar;