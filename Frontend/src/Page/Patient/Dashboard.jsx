import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Settings } from "lucide-react";
import Sidebar from "../../Component/Sidebar";
import SlideImage from "../../Component/Slideimage";

const PatientDashboard = () => {
  const navigate = useNavigate(); 
  const { id } = useParams();
  const [fullName, setFullName] = useState("");
  const storedUserId = localStorage.getItem("userId");
  const userId = id || storedUserId;

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/users/${userId}`);
        const data = await response.json();
        setFullName(data.name);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  return (
    <div className="flex">
      <Sidebar role="patient" />
      <div className="flex flex-col w-full">
        <div className="flex justify-end items-center gap-4 p-4">
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => {/* Add settings navigation */}}
          >
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
          <div 
            className="w-10 h-10 rounded-full bg-gray-200 cursor-pointer overflow-hidden"
            onClick={() => navigate(`/Patient/profile`)} // Navigate to Patient Profile
          >
            <img
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="p-6">
          <h2 
            className="text-4xl font-serif font-semibold text-gray-800" 
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            Welcome, {fullName || "Loading..."}
          </h2>
          <SlideImage />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
