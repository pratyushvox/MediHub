import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import Sidebar from "../../Component/Sidebar";
import ReusableTable from "../../Component/Table";
import Button from "../../Component/Button";
import DoctorSignup from "../Doctor/Doctorsignup";
import { baseUrl } from "../../Constant/Constant.js";

const DoctorList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${baseUrl}doctor/getdoctor`);
      const data = await response.json();
      
      // Filter out any non-doctor objects (like message objects)
      const validDoctors = data.filter(item => item._id && item.name);
      
      if (response.ok) {
        setDoctors(validDoctors);
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
        // Immediately fetch the updated list of doctors
        await fetchDoctors();
        setIsModalOpen(false);
      } else {
        console.error("Failed to add doctor:", responseData.message);
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  const columns = [
    
    { header: "Doctor Name", accessor: "name" },
    { header: "Contact No", accessor: "phone" },
    { header: "Specialist", accessor: "specialist" },
    { header: "Available Time", accessor: "availableTime" },
  ];

  const handleEdit = (doctor) => {
    console.log("Edit doctor:", doctor);
  };

  const handleDelete = async (doctorId) => {
    try {
      const response = await fetch(`${baseUrl}doctor/delete/${doctorId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        // Immediately fetch the updated list of doctors
        await fetchDoctors();
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />

      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Doctor List</h1>
        </div>

        <div className="flex justify-between mb-6">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search Doctor"
              className="w-full py-2 px-4 pr-10 bg-teal-100 bg-opacity-40 rounded-lg text-sm"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={18} />
            </button>
          </div>

          <div className="flex space-x-4">
            <Button 
              text="Add Doctor" 
              onClick={() => setIsModalOpen(true)} 
              className="bg-teal-400 text-white px-4 py-2 rounded-lg text-sm" 
            />
            <button className="flex items-center bg-teal-400 text-white px-4 py-2 rounded-lg text-sm">
              Filter
              <Filter size={16} className="ml-2" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <ReusableTable
            columns={columns}
            data={doctors}
            onEdit={handleEdit}
            onDelete={handleDelete}
            striped
            hoverable
            bordered
          />
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