import React from "react";
import { FaUsers, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Component/Sidebar";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/Admin/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Component with 'admin' role */}
      <Sidebar role="admin" className="w-64" />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-extrabold text-[#3CB5AC] mb-6">
          Admin Dashboard
        </h1>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-700">Total Users</h2>
              <p className="text-3xl font-extrabold text-[#0665A7]">150</p>
            </div>
            <FaUsers className="text-4xl text-[#0665A7]" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-700">Doctors</h2>
              <p className="text-3xl font-extrabold text-[#0665A7]">50</p>
            </div>
            <FaUsers className="text-4xl text-[#0665A7]" />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-700">Patients</h2>
              <p className="text-3xl font-extrabold text-[#0665A7]">100</p>
            </div>
            <FaUsers className="text-4xl text-[#0665A7]" />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
          <h2 className="text-2xl font-bold text-[#0665A7] mb-4">
            Recent Activities
          </h2>
          <ul>
            <li className="border-b py-4">
              <span className="font-bold">Dr. John Doe</span> has joined the
              platform.
            </li>
            <li className="border-b py-4">
              <span className="font-bold">Patient Jane Smith</span> has
              registered.
            </li>
            <li className="border-b py-4">
              <span className="font-bold">Admin</span> updated user information.
            </li>
          </ul>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
