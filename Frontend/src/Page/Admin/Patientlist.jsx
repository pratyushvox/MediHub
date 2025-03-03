import React from 'react';
import { Search, Filter } from 'lucide-react';
import Sidebar from '../../Component/Sidebar';
import ReusableTable from '../../Component/Table';

const PatientList = () => {
  // Column definition for the doctor table
  const columns = [
    { header: 'Patient id', accessor: 'patientId' },
    { header: 'Patient name', accessor: 'patientName' },
    { header: 'Contact no', accessor: 'contactNo' },
    { header: 'Reason', accessor: 'Reason' },
    { header: 'Appointed Dr', accessor: 'AppointedDr' },
  ];

  // Sample data for doctors
  const doctorsData = Array(8).fill().map(() => ({
    patientId: '17850',
    patientName: 'Prahyun khadka',
    contactNo: '9811321567',
    Reason: 'headche',
    AppointedDr: 'simpal korala',
  }));

  const handleEdit = (doctor) => {
    console.log('Edit doctor:', doctor);
    // Implement edit functionality
  };

  const handleDelete = (doctor) => {
    console.log('Delete doctor:', doctor);
    // Implement delete functionality
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Import your existing Sidebar component with admin role */}
      <Sidebar role="admin" />
      
      <div className="flex-1 p-6 overflow-auto">
        {/* Header with title and user profile */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Doctor List</h1>
          <div className="flex items-center">
            <button className="p-2 rounded-full bg-gray-100 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              <img
                src="/profile-placeholder.jpg"
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="flex justify-between mb-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search Patient"
              className="w-full py-2 px-4 pr-10 bg-teal-100 bg-opacity-40 rounded-lg text-sm"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </button>
          </div>
          
          <button className="flex items-center bg-teal-400 text-white px-4 py-2 rounded-lg text-sm">
            Filter
            <Filter size={16} className="ml-2" />
          </button>
        </div>
        
        {/* Doctor Table using your existing ReusableTable component */}
        <div className="bg-white rounded-lg shadow">
          <ReusableTable
            columns={columns}
            data={doctorsData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            striped={true}
            hoverable={true}
            bordered={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientList;