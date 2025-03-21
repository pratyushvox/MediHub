import React, { useState } from 'react';
import { FaCreditCard, FaBell, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PatientProfile from '../Page/Patient/Patientprofile';
import  EditPatientProfile from '../page/Patient/Editprofile';

const PatientNavbar = ({ pageTitle }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const navigate = useNavigate();

  const toggleProfilePopup = () => {
    setShowProfile(!showProfile);
  };

  const toggleUserPopup = () => {
    setShowUserPopup(!showUserPopup);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleShowEditProfile = () => {
    setShowEditProfile(true);
    setShowUserPopup(false); // Close user popup when opening edit profile
  };

  const handleCloseEditProfile = () => {
    setShowEditProfile(false);
  };

  return (
    <>
      <nav className="flex justify-between items-center p-4 bg-white shadow-md relative">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-600">{pageTitle}</h1>
        </div>

        <div className="flex gap-6">
          <FaCreditCard
            className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300"
            onClick={toggleProfilePopup}
          />
          <FaBell className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300" />
          <div className="relative">
            <FaUserCircle
              className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300"
              onClick={toggleUserPopup}
            />
            {showUserPopup && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                <div className="flex flex-col gap-2 p-2">
                  <button className="text-left hover:bg-gray-100 p-2 rounded" onClick={handleShowEditProfile}>
                    Edit Profile
                  </button>
                  <button
                    className="text-left hover:bg-gray-100 p-2 rounded"
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
          className="text-gray-500 hover:text-gray-700"
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
