import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Settings, Bell, ClipboardList, Calendar, FlaskRound as Flask, Pill, Bell as BellIcon } from "lucide-react";
import Sidebar from "../../Component/Sidebar";
import { Card } from "../../component/Card";
import Box from "../../Component/Box"; // Import the Box component
import HealthOverview from "../../Component/Overview"; // Import the HealthOverview component
import PatientNavbar from "../../Component/Patientnavbar"; // Import the new Navbar

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fullName, setFullName] = useState("");
  const storedUserId = localStorage.getItem("Userid");
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
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 z-40">
        <Sidebar role="patient" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full bg-gray-100 min-h-screen ml-64 mt-10">
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-64 right-0 z-30">
          <PatientNavbar pageTitle="Dashboard of Patients" />
        </div>

        {/* Scrollable Content */}
        <div className="pt-16 p-8"> {/* Add padding-top to account for the fixed navbar */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0367A5]">Patient Dashboard</h1>
              <p className="text-gray-600 text-lg">
                Welcome back, {fullName || "Loading"}! Here's your health overview.
              </p>
            </div>
            <button
              className="px-4 py-2 bg-[#0367A5] text-white rounded-lg flex items-center gap-2 hover:bg-[#024e7a] transition"
              onClick={() => navigate("/book-appointment")}
            >
              <span className="text-xl text-white">➕</span> Book Appointment
            </button>
          </div>

          {/* Health Overview Component */}
          
          {/* Boxes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Box
              icon={<Calendar className="text-[#0367A5]" />}
              count="1"
              label="Total Appointments"
              className="bg-white"
              onClick={() => navigate("/appointments")}
            />
            <Box
              icon={<ClipboardList className="text-[#3CB5AC]" />}
              count="1"
              label="Online Meeting"
              className="bg-white"
              onClick={() => navigate("/online-meetings")}
            />
            <Box
              icon={<Pill className="text-[#70CFC5]" />}
              count="1"
              label="My Medicine"
              className="bg-white"
              onClick={() => navigate("/medicines")}
            />
            <Box
              icon={<Flask className="text-[#70CFC5]" />}
              count="1"
              label="My Medicine"
              className="bg-white"
              onClick={() => navigate("/medicines")}
            />
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              title="Upcoming Appointment"
              icon={<div className="bg-blue-100 p-2 rounded-full"><Calendar className="w-6 h-6 text-blue-500" /></div>}
            >
              <div className="h-[200px] flex flex-col">
                <div className="flex-1">
                  <div className="text-xl font-bold">March 18, 2025</div>
                  <div className="text-gray-600 flex items-center gap-2 mt-2">
                    <span>10:30 AM - Dr. Smith</span>
                  </div>
                  <div className="mt-4">
                    <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm">
                      Annual Check-up
                    </span>
                  </div>
                </div>
                <button className="text-blue-600 hover:underline w-full text-center bg-blue-50 py-2 rounded-md">
                  View All Appointments
                </button>
              </div>
            </Card>

            <Card
              title="Recent Lab Results"
              icon={<div className="bg-green-100 p-2 rounded-full"><Flask className="w-6 h-6 text-green-500" /></div>}
            >
              <div className="h-[200px] flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <span>Cholesterol</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                      Normal
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Blood Pressure</span>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                      Elevated
                    </span>
                  </div>
                </div>
                <button className="text-green-600 hover:underline w-full text-center bg-green-50 py-2 rounded-md">
                  View All Results
                </button>
              </div>
            </Card>

            <Card
              title="Prescription Alerts"
              icon={<div className="bg-red-100 p-2 rounded-full"><Pill className="w-6 h-6 text-red-500" /></div>}
            >
              <div className="h-[200px] flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-red-600">
                    <span>Lisinopril Refill Due</span>
                  </div>
                  <div className="text-gray-600 mt-2">3 days remaining</div>
                  <div className="mt-4 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full w-1/4"></div>
                  </div>
                  <div className="text-right text-red-600 text-sm mt-1">25% left</div>
                </div>
                <button className="text-red-600 hover:underline w-full text-center bg-red-50 py-2 rounded-md">
                  Manage Prescriptions
                </button>
              </div>
            </Card>

            <Card
              title="Health Reminders"
              icon={<div className="bg-purple-100 p-2 rounded-full"><BellIcon className="w-6 h-6 text-purple-500" /></div>}
            >
              <div className="h-[200px] flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <span>Flu Shot</span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      Due Soon
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Dental Check-up</span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      Upcoming
                    </span>
                  </div>
                </div>
                <button className="text-purple-600 hover:underline w-full text-center bg-purple-50 py-2 rounded-md">
                  View All Reminders
                </button>
              </div>
            </Card>
          </div>
        </div>
        <HealthOverview />
      </div>
    </div>
  );
};

export default PatientDashboard;