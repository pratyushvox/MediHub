import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import Sidebar from '../../Component/Sidebar';
import ReusableTable from '../../Component/Table';
import PatientDialog from '../../Component/PatientDialog.jsx';
import EditPatientDialog from '../../Component/Editpatientdialog.jsx';
import { toast } from 'react-toastify';
import DeleteDialog from '../../Component/Deletedialog.jsx';
import Button from '../../Component/Button';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null); 
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    gender: 'All Genders',
    bloodGroup: 'All Blood Groups',
    ageRange: 'All Ages'
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/users/users");
        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }
        const data = await response.json();
        const processedData = data.map(patient => ({
          ...patient,
          ageGender: `${patient.personalinfo?.age || 'N/A'} / ${patient.personalinfo?.gender || 'N/A'}`,
          medicalInfo: `${patient.personalinfo?.bloodGroup || 'N/A'} ${patient.personalinfo?.medicalConditions ? '| ' + patient.personalinfo?.medicalConditions : ''}`
        }));
        setPatients(processedData);
        setFilteredPatients(processedData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Apply filters whenever patients, searchTerm or filters change
  useEffect(() => {
    const results = patients.filter(patient => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm);

      // Gender filter
      const matchesGender = filters.gender === 'All Genders' || 
        patient.personalinfo?.gender === filters.gender;
      
      // Blood group filter
      const matchesBloodGroup = filters.bloodGroup === 'All Blood Groups' || 
        patient.personalinfo?.bloodGroup === filters.bloodGroup;
      
      // Age range filter
      let matchesAge = true;
      if (filters.ageRange !== 'All Ages') {
        const [min, max] = filters.ageRange.split('-').map(Number);
        const age = patient.personalinfo?.age;
        matchesAge = age >= min && (!max || age <= max);
      }
      
      return matchesSearch && matchesGender && matchesBloodGroup && matchesAge;
    });
    
    setFilteredPatients(results);
  }, [patients, searchTerm, filters]);

  const columns = [
    { header: 'Patient ID', accessor: 'patientId' },
    { header: 'Patient Name', accessor: 'name' },
    { header: 'Contact No', accessor: 'phone' },
    { header: 'Age/Gender', accessor: 'ageGender' },
    { header: 'Medical Info', accessor: 'medicalInfo' }
  ];

  const handleEdit = async (patient) => {
    if (!patient) return;
    
    try {
      const updatedData = {
        Id: patient?.patientId,
        name: patient?.name,
        phone: patient?.phone,
        address: patient.personalinfo?.address || "",
        district: patient.personalinfo?.district || "",
        province: patient.personalinfo?.province || "",
        bloodGroup: patient.personalinfo?.bloodGroup || "",
        allergies: patient.personalinfo?.allergies || "",
        medicalConditions: patient.personalinfo?.medicalConditions || "",
        emergencyContact: patient.personalinfo?.emergencyContact || "",
      };
  
      const response = await fetch(`http://localhost:4000/api/users/update-user-details/${patient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update user data");
      }
  
      const updatedResponse = await response.json();
      toast.success(updatedResponse.message);
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update patient information");
    }
  };
  
  const handleDelete = async (patient) => {
    if (!patient?._id) {
      toast.error("No patient selected for deletion");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:4000/api/users/delete/${patient._id}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        setPatients(prev => prev.filter(p => p._id !== patient._id));
        setFilteredPatients(prev => prev.filter(p => p._id !== patient._id));
        setDeletingPatient(null);
        toast.success("Patient deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete patient");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      gender: 'All Genders',
      bloodGroup: 'All Blood Groups',
      ageRange: 'All Ages'
    });
    setSearchTerm('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Patient List</h1>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-[#e7faf7] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Button */}
          <div className="flex space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center bg-teal-400 text-white px-4 py-2 rounded-lg text-sm"
            >
              <Filter size={16} className="mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Dropdown */}
        {showFilters && (
          <div className="bg-white p-4 rounded-md shadow-md mb-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                >
                  <option>All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select 
                  name="bloodGroup"
                  value={filters.bloodGroup}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                >
                  <option>All Blood Groups</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                <select 
                  name="ageRange"
                  value={filters.ageRange}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                >
                  <option>All Ages</option>
                  <option value="0-12">0-12</option>
                  <option value="13-19">13-19</option>
                  <option value="20-35">20-35</option>
                  <option value="36-50">36-50</option>
                  <option value="51-100">51+</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium mr-2"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-teal-400 text-white rounded-md text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <p className="p-4 text-center">Loading...</p>
          ) : error ? (
            <p className="p-4 text-center text-red-500">{error}</p>
          ) : (
            <ReusableTable
              columns={columns}
              data={filteredPatients}
              onEdit={(patient) => setEditingPatient(patient)}
              onDelete={(patient) => setDeletingPatient(patient)}
              striped={true}
              hoverable={true}
              bordered={true}
              onClick={(patient) => setSelectedPatient(patient)}
            />
          )}
        </div>

        {selectedPatient && (
          <PatientDialog user={selectedPatient} onClose={() => setSelectedPatient(null)} />
        )}

        {editingPatient && (
          <EditPatientDialog 
            data={editingPatient} 
            onClose={() => setEditingPatient(null)} 
            onSave={handleEdit}
          />
        )}

        {deletingPatient && (
          <DeleteDialog
            onConfirm={() => handleDelete(deletingPatient)}
            onClose={() => setDeletingPatient(null)}
          />
        )}
      </div>
    </div>
  );
};

export default PatientList;