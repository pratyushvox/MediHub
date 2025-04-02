import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import Sidebar from "../../Component/Sidebar";
import ReusableTable from "../../Component/Table";
import Button from "../../Component/Button";
import DoctorSignup from "../Doctor/Doctorsignup";
import { baseUrl } from "../../Constant/Constant.js";
import DoctorDialog from "../../Component/DoctorDialog.jsx";
import EditDoctorProfileDialog from "../../Component/Editdoctordialog.jsx";
import DeleteDialog from "../../Component/Deletedialog.jsx";
import { toast } from "react-toastify";

const DoctorList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deletingDoctor, setDeletingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialist: "All Specialties",
    priceRange: "All Prices",
    availability: "All Availability"
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    // Apply filters whenever doctors, searchTerm or filters change
    const results = doctors.filter(doctor => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialist?.toLowerCase().includes(searchTerm.toLowerCase());

      // Specialist filter
      const matchesSpecialist = filters.specialist === "All Specialties" || 
        doctor.specialist === filters.specialist;
      
      // Price range filter
      let matchesPrice = true;
      if (filters.priceRange !== "All Prices") {
        const [min, max] = filters.priceRange.split("-").map(Number);
        matchesPrice = doctor.price >= min && (!max || doctor.price <= max);
      }
      
      // Availability filter
      const matchesAvailability = filters.availability === "All Availability" || 
        (filters.availability === "Available" && doctor.availableTime) ||
        (filters.availability === "Not Available" && !doctor.availableTime);
      
      return matchesSearch && matchesSpecialist && matchesPrice && matchesAvailability;
    });
    
    setFilteredDoctors(results);
  }, [doctors, searchTerm, filters]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${baseUrl}doctor/getdoctor`);
      const data = await response.json();
      console.log(data);

      // Filter out any non-doctor objects (like message objects)
      const validDoctors = data.filter(item => item._id && item.name);
      
      if (response.ok) {
        setDoctors(validDoctors);
        setFilteredDoctors(validDoctors);
      } else {
        console.error("Failed to fetch doctors:", data.message);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const addDoctorToList = async (newDoctorData) => {
    try {
      const response = await fetch(`${baseUrl}doctor/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDoctorData)
      });

      const responseData = await response.json();

      if (response.ok) {
        await fetchDoctors();
        setIsModalOpen(false);
        toast.success("Doctor added successfully");
      } else {
        toast.error(responseData.message || "Failed to add doctor");
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
      toast.error("Error adding doctor");
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
      specialist: "All Specialties",
      priceRange: "All Prices",
      availability: "All Availability"
    });
    setSearchTerm("");
  };

  const columns = [
    { header: "Doctor Name", accessor: "name" },
    { header: "Contact No", accessor: "phone" },
    { header: "Specialist", accessor: "specialist" },
    { header: "Available Time", accessor: "availableTime" },
    { header: "Consultation Fee (Rs)", accessor: "price" },
  ];

  const handleEdit = async (updatedDoctor) => {
    try {
      const response = await fetch(`${baseUrl}doctor/updatedetails/${updatedDoctor._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDoctor),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        await fetchDoctors();
        setEditingDoctor(null);
        toast.success("Doctor updated successfully");
      } else {
        toast.error(responseData.message || "Failed to update doctor");
      }
    } catch (error) {
      console.error("Error updating doctor:", error);
      toast.error("Error updating doctor");
    }
  };

  const handleDelete = async (doctorToDelete) => {
    if (!doctorToDelete) {
      toast.error("No doctor selected for deletion");
      return;
    }
    
    try {
      const response = await fetch(`${baseUrl}doctor/deletedoctor/${doctorToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDoctors();
        setDeletingDoctor(null);
        toast.success("Doctor deleted successfully");
      } else {
        toast.error("Failed to delete doctor");
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast.error("Error deleting doctor");
    }
  };
   
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />

      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Doctor List</h1>
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
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter Button */}
          <div className="flex space-x-4">
            <Button 
              text="Add Doctor" 
              onClick={() => setIsModalOpen(true)} 
              className="bg-teal-400 text-white px-4 py-2 rounded-lg text-sm" 
            />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <select 
                  name="specialist"
                  value={filters.specialist}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                >
                  <option>All Specialties</option>
                  {/* Dynamically generate options based on available specialties */}
                  {[...new Set(doctors.map(d => d.specialist))].map(specialist => (
                    <option key={specialist} value={specialist}>{specialist}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <select 
                  name="priceRange"
                  value={filters.priceRange}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                >
                  <option>All Prices</option>
                  <option value="0-500">Under ₹500</option>
                  <option value="500-1000">₹500 - ₹1000</option>
                  <option value="1000-2000">₹1000 - ₹2000</option>
                  <option value="2000-">Above ₹2000</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select 
                  name="availability"
                  value={filters.availability}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                >
                  <option>All Availability</option>
                  <option value="Available">Available</option>
                  <option value="Not Available">Not Available</option>
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
          <ReusableTable
            columns={columns}
            data={filteredDoctors}
            onEdit={(doctor) => setEditingDoctor(doctor)}
            onDelete={(doctor) => setDeletingDoctor(doctor)}
            striped
            hoverable
            bordered
            onClick={(doctor) => setSelectedDoctor(doctor)}
          />
          
          {selectedDoctor && (
            <DoctorDialog user={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
          )}
          
          {editingDoctor && (
            <EditDoctorProfileDialog 
              data={editingDoctor} 
              onClose={() => setEditingDoctor(null)} 
              onSave={handleEdit} 
            />
          )}
          
          {deletingDoctor && 
            (<DeleteDialog 
              onConfirm={() => handleDelete(deletingDoctor._id)} 
              onClose={() => setDeletingDoctor(null)}
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <DoctorSignup 
          closeModal={() => setIsModalOpen(false)} 
          addDoctorToList={addDoctorToList} 
        />
      )}
    </div>
  );
};

export default DoctorList;