import React from "react"; 
import { FaUsers, FaUserMd, FaProcedures, FaMoneyBillWave } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom"; 
import Sidebar from "../../Component/Sidebar"; 
import Box from "../../Component/Box"; 

const AdminDashboard = () => {   
  const navigate = useNavigate();    

  const handleLogout = () => {     
    localStorage.removeItem("authToken");     
    navigate("/Admin/login");   
  };    

  return (     
    <div className="flex h-screen bg-gray-100">       
      <Sidebar role="admin" className="w-64" />        
      
      <div className="flex-1 p-8 overflow-hidden">         
        <h1 className="text-3xl font-extrabold text-[#3CB5AC] mb-6">           
          Admin Dashboard         
        </h1>          
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">           
          <Box 
            icon={<FaUsers />} 
            count={23} 
            label="Total Patients" 
            className="bg-[#4FA4A2] text-white"
          />           
          <Box 
            icon={<FaUserMd />} 
            count={23} 
            label="Total Appointment" 
            className="bg-[#5BA4D3] text-white"
          />           
          <Box 
            icon={<FaProcedures />} 
            count={23} 
            label="Total Doctors" 
            className="bg-[#7FC3D1] text-white"
          />           
          <Box 
            icon={<FaMoneyBillWave />} 
            count={23} 
            label="Total Income" 
            className="bg-[#54AFA2] text-white"
          />         
        </div>          
        
        {/* Placeholder for Charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md h-64">
            <div className="p-4 text-center text-gray-500">
              Inventory Chart 1 Placeholder
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md h-64">
            <div className="p-4 text-center text-gray-500">
              Inventory Chart 2 Placeholder
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Appointment Request Table */}
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <div className="p-4 border-b font-bold text-[#0665A7]">
              Appointment Request
            </div>
            <div className="overflow-y-auto max-h-64">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Patient Name</th>
                    <th className="p-2 text-left">Doctor Name</th>
                    <th className="p-2 text-left">Phone Number</th>
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(10)].map((_, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">Pratyush Khadka</td>
                      <td className="p-2">Pratyush Khadka</td>
                      <td className="p-2">Pratyush Khadka</td>
                      <td className="p-2">7-8</td>
                      <td className="p-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-red-500 ml-2">×</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Appointment Table */}
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <div className="p-4 border-b font-bold text-[#0665A7]">
              Total Appointment
            </div>
            <div className="overflow-y-auto max-h-64">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Patient Name</th>
                    <th className="p-2 text-left">Doctor Name</th>
                    <th className="p-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(10)].map((_, index) => (
                    <tr 
                      key={index} 
                      className={`
                        ${index % 4 === 0 ? 'bg-red-50' : 
                          index % 4 === 1 ? 'bg-yellow-50' : 
                          index % 4 === 2 ? 'bg-green-50' : 'bg-red-50'}
                        border-b
                      `}
                    >
                      <td className="p-2">Pratyush Khadka</td>
                      <td className="p-2">Dr. Samer Shrestha</td>
                      <td className="p-2">10:50</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
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
