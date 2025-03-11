import React, { useState, useEffect } from 'react';
import { Settings, MessageSquare } from 'lucide-react';
import Sidebar from '../../Component/Sidebar'; // Import Sidebar component

function PatientProfile() {
  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop",
    gender: "",
    birthDate: "",
    phoneNo: "",
    address: "",
    registeredDate: "",
    notes: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const userId = localStorage.getItem("Userid");
        
        if (!userId) {
          throw new Error("User ID not found in localStorage");
        }
        
        const response = await fetch(`http://localhost:4000/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const userData = await response.json();
        
        // Create notes array from medical conditions, major surgery, and blood group
        const notesArray = [];
        if (userData.personalinfo.medicalConditions) 
          notesArray.push(userData.personalinfo.medicalConditions);
        if (userData.personalinfo.majorSurgery) 
          notesArray.push(userData.personalinfo.majorSurgery);
        if (userData.personalinfo.bloodGroup) 
          notesArray.push(`Blood Group: ${userData.personalinfo.bloodGroup}`);
        
        setPatientData({
          name: userData.name,
          email: userData.email,
          image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop", // Keep existing avatar
          gender: userData.personalinfo.gender || "",
          birthDate: userData.personalinfo.dobAD || "",
          phoneNo: userData.phone || userData.personalinfo.phoneNumber || "",
          address: `${userData.personalinfo.address || ""}, ${userData.personalinfo.ward || ""}, ${userData.personalinfo.district || ""}, ${userData.personalinfo.province || ""}`,
          registeredDate: new Date(userData.createdAt).toLocaleDateString(),
          notes: notesArray
        });
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const appointments = [
    {
      date: "Nov 3",
      time: "7:00-8:00",
      doctor: "Pratyush Khadka",
      treatment: "Bandages on broken hand"
    },
    {
      date: "Nov 3",
      time: "7:00-8:00",
      doctor: "Pratyush Khadka",
      treatment: "Bandages on broken hand"
    }
  ];

  if (loading) {
    return (
      <div className="flex">
        <Sidebar role="patient" />
        <div className="min-h-screen bg-gray-50 p-8 w-full flex items-center justify-center">
          <p>Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex">
        <Sidebar role="patient" />
        <div className="min-h-screen bg-gray-50 p-8 w-full flex items-center justify-center">
          <p className="text-red-500">Error loading patient data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Sidebar for patient navigation */}
      <Sidebar role="patient" />

      <div className="min-h-screen bg-gray-50 p-8 w-full">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-end gap-4 mb-8">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Settings className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-[#2E86C1] text-white rounded-lg p-6 text-center">
              <img
                src={patientData.image}
                alt={patientData.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold mb-1">{patientData.name}</h2>
              <p className="text-sm mb-4">{patientData.email}</p>
              <button className="bg-white text-[#2E86C1] px-6 py-2 rounded-md flex items-center justify-center gap-2 w-full">
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
            </div>

            {/* Patient Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Gender</h3>
                  <p>{patientData.gender}</p>
                </div>
                <div>
                  <h3 className="font-medium">Birth date</h3>
                  <p>{patientData.birthDate}</p>
                </div>
                <div>
                  <h3 className="font-medium">Phone No</h3>
                  <p>{patientData.phoneNo}</p>
                </div>
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p>{patientData.address}</p>
                </div>
                <div>
                  <h3 className="font-medium">Registered Date</h3>
                  <p>{patientData.registeredDate}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Notes</h3>
              <ul className="space-y-2">
                {patientData.notes.length > 0 ? (
                  patientData.notes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))
                ) : (
                  <li>No medical notes available</li>
                )}
              </ul>
            </div>
          </div>

          {/* Medical Records Tab */}
          <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#B2D6DE] p-4">
              <div className="flex justify-between">
                <button className="font-medium w-1/3 text-center py-2">Appointment</button>
                <button className="font-medium w-1/3 text-center py-2">Medical Record</button>
                <button className="font-medium w-1/3 text-center py-2">Prescription</button>
              </div>
            </div>

            {/* Appointments Timeline */}
            <div className="p-6">
              <div className="space-y-6">
                {appointments.map((appointment, index) => (
                  <div key={index} className="flex">
                    <div className="relative mr-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      {index !== appointments.length - 1 && (
                        <div className="absolute top-3 left-1.5 w-0.5 h-16 bg-gray-200"></div>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{appointment.date}</h4>
                          <p className="text-sm text-gray-500">{appointment.time}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Doctor</p>
                        <p className="text-sm">{appointment.doctor}</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Treatment</p>
                        <p className="text-sm">{appointment.treatment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PatientProfile;