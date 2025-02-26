import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../Component/Sidebar";
import Navbar from "../../Component/NavbarDashboard";
import SlideImage from "../../Component/Slideimage";

const PatientDashboard = () => {
  const { id } = useParams(); // Get userId from URL if available
  const [fullName, setFullName] = useState("");
  const storedUserId = localStorage.getItem("userId"); // Retrieve userId from localStorage
  const userId = id || storedUserId; // Use URL param if available, else use localStorage

  useEffect(() => {
    if (!userId) return; // Prevent unnecessary fetch

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
        <Navbar />
        <div className="p-6">
          <h2 className="text-4xl font-serif font-semibold text-gray-800" style={{ fontFamily: "'Roboto', sans-serif" }}>
            Welcome, {fullName || "Loading..."}
          </h2>
          <SlideImage />
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
