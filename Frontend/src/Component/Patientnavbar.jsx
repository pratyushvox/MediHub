import React, { useState } from 'react';
import { FaCreditCard, FaBell, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import PatientProfile from '../Page/Patient/Patientprofile';

const PatientNavbar = ({ pageTitle }) => {
  const navigate = useNavigate(); // Initialize navigate function

  const [showProfile, setShowProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleProfilePopup = () => {
    setShowProfile(!showProfile);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Logout function to navigate to /login
  const handleLogout = () => {
    // Perform any logout actions (e.g., clearing local storage, auth state)
    navigate('/login'); // Redirect to login page
  };

  return (
    <>
      <nav className="flex justify-between items-center p-4 bg-white shadow-md relative">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-600">{pageTitle}</h1>
        </div>

        <div className="flex gap-6 relative">
          <FaCreditCard className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300" />
          <FaBell className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300" />
          
          <div className="relative">
            <FaUserCircle 
              className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300"
              onClick={toggleDropdown} 
            />
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <ul className="py-2">
                  <li 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={toggleProfilePopup}
                  >
                    Edit Profile
                  </li>
                  <li 
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleLogout} // Navigate to /login
                  >
                    Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

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
    </>
  );
};

export default PatientNavbar;
