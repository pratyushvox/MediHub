import React, { useEffect, useState } from "react";
import AppointmentCard from "../../Component/Appointmentbox";

const AppointmentsList = () => {
  const [patient, setPatient] = useState(null);
  const userId = localStorage.getItem("userId"); // Retrieve userId from localStorage

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:4000/api/users/${userId}`);
        const data = await response.json();
        
        // Update state with patient details
        setPatient({
          name: data.name || "N/A",
          mobile: data.mobile || "N/A",
          address: data.address || "N/A",
          profilePic: data.profilePic || "/path/to/default-profile.png" // Default profile pic if not available
        });
      } catch (error) {
        console.error("Error fetching patient details:", error);
      }
    };

    fetchPatientDetails();
  }, [userId]);

  // Dummy data array (Replace with actual data from your database)
  const appointments = [
    {
      doctor: "Dr. Bipin Neupane",
      specialty: "GENERAL MEDICINE",
      patient: "Pratyush Khadka",
      appDateAD: "2025/02/16 AD 01:25 PM",
      appDateBS: "2081/11/04 BS SUNDAY",
      appNumber: "55530054",
      urgent: true,
      telemedicine: true,
    },
    {
      doctor: "Dr. CHIRAG KC",
      specialty: "GENERAL MEDICINE",
      patient: "Pratyush Khadka",
      appDateAD: "2024/12/15 AD 02:50 PM",
      appDateBS: "2081/08/30 BS SUNDAY",
      appNumber: "55522068",
      urgent: true,
      telemedicine: true,
    },
    {
      doctor: "Dr. AMIT SHRIVASTAV",
      specialty: "MEDICINE",
      hospital: "Civil Service Hospital",
      patient: "Pratyush Khadka",
      appDateAD: "2023/12/21 AD 09:30 AM",
      appDateBS: "2080/09/05 BS THURSDAY",
      appNumber: "41165006",
      urgent: false,
      telemedicine: false,
      paid: "ESEWA Rs. 101.50"
    }
  ];

  return (
    <div className="p-4">
      {/* Patient Info */}
      <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md mb-4">
        {patient ? (
          <>
            <div className="flex items-center">
              <img src={patient.profilePic} alt="Profile" className="w-10 h-10 rounded-full mr-2" />
              <p className="font-semibold">
                Patient Name: <span className="text-blue-600">{patient.name}</span>
              </p>
            </div>
            <div>
              <p className="font-semibold">
                Mobile No: <span className="text-blue-600">{patient.mobile}</span>
              </p>
            </div>
            <div>
              <p className="font-semibold">
                Address: <span className="text-blue-600">{patient.address}</span>
              </p>
            </div>
            <button className="bg-red-500 text-white px-4 py-2 rounded-md">Edit Profile</button>
          </>
        ) : (
          <p>Loading patient details...</p>
        )}
      </div>

      {/* Appointment Filters */}
      <div className="flex space-x-2 mb-4">
        <button className="bg-red-500 text-white px-4 py-2 rounded-md">All</button>
        <button className="border px-4 py-2 rounded-md">Upcoming</button>
        <button className="border px-4 py-2 rounded-md">Past</button>
        <button className="border px-4 py-2 rounded-md">Cancelled</button>
      </div>

      {/* Appointment List */}
      <div className="flex gap-4">
        {appointments.map((appt, index) => (
          <AppointmentCard key={index} appointment={appt} />
        ))}
      </div>
    </div>
  );
};

export default AppointmentsList;
