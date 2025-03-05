import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import Sidebar from '../../Component/Sidebar';
import ReusableTable from '../../Component/Table';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/users/users");
        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Column definition for the patient table
  const columns = [
  
    { header: 'Patient Name', accessor: 'name' },
    { header: 'Contact No', accessor: 'phone' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Appointed Dr', accessor: 'appointedDoctor' },
  ];

  const handleEdit = (patient) => {
    console.log('Edit patient:', patient);
    // Implement edit functionality
  };

  const handleDelete = (patient) => {
    console.log('Delete patient:', patient);
    // Implement delete functionality
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Patient List</h1>
        </div>
        
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
        
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <p className="p-4 text-center">Loading...</p>
          ) : error ? (
            <p className="p-4 text-center text-red-500">{error}</p>
          ) : (
            <ReusableTable
              columns={columns}
              data={patients}
              onEdit={handleEdit}
              onDelete={handleDelete}
              striped={true}
              hoverable={true}
              bordered={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;
