import React from 'react';
import { FaCreditCard, FaBell, FaUserCircle } from 'react-icons/fa'; // Import icons from react-icons

const PatientNavbar = ({ pageTitle }) => {
  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-md">
      {/* Left Side: Page Title */}
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-600">{pageTitle}</h1>
      </div>

      {/* Right Side: Icons */}
      <div className="flex gap-6">
        <FaCreditCard className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300" />
        <FaBell className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300" />
        <FaUserCircle className="text-2xl text-[#0056b3] cursor-pointer hover:text-gray-300" />
      </div>
    </nav>
  );
};

export default PatientNavbar;
