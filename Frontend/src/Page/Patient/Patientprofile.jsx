import React, { useState, useEffect } from 'react';

function PatientProfile() {
  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    gender: "",
    birthDate: "",
    phoneNo: "",
    address: "",
    registeredDate: "",
    bloodGroup: "",
    patientId: "",
    emergencyContact: "",
    allergies: [],
    currentMedications: []
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
        
        // Extract allergies and medications from medical conditions if available
        let allergies = [];
        let medications = [];
        
        if (userData.personalinfo.allergies) {
          allergies = userData.personalinfo.allergies.split(',').map(item => item.trim());
        }
        
        if (userData.personalinfo.currentMedications) {
          medications = userData.personalinfo.currentMedications.split(',').map(item => item.trim());
        }
        
        setPatientData({
          name: userData.name,
          email: userData.email,
          gender: userData.personalinfo.gender || "",
          birthDate: userData.personalinfo.dobAD || "",
          phoneNo: userData.phone || userData.personalinfo.phoneNumber || "",
          address: `${userData.personalinfo.address || ""}, ${userData.personalinfo.district || ""}, ${userData.personalinfo.province || ""}`,
          registeredDate: new Date(userData.createdAt).toLocaleDateString(),
          bloodGroup: userData.personalinfo.bloodGroup || "",
          patientId: userData.patientId || `PAT-${new Date().getFullYear()}-${String(userId).padStart(3, '0')}`,
          emergencyContact: userData.personalinfo.emergencyContact || "",
          allergies: allergies.length > 0 ? allergies : ["None listed"],
          currentMedications: medications.length > 0 ? medications : ["None listed"]
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading patient data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading patient data: {error}</p>
      </div>
    );
  }

  // Get patient initials for the avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-white shadow-md rounded-lg max-w-2xl mx-auto">
      {/* Header with close button */}
      <div className="flex justify-between items-center p-5 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h1 className="text-lg font-medium">Patient Card</h1>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="p-4">
        <div className="flex flex-row">
          {/* Avatar section */}
          <div className="mr-6">
            <div className="w-28 h-28 bg-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {getInitials(patientData.name)}
            </div>
            
          </div>

          {/* Patient details */}
          <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-3">
            <div>
              <h3 className="text-gray-500 text-xs">FULL NAME</h3>
              <p className="font-bold text-base">{patientData.name}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-xs">PATIENT ID</h3>
              <p className="font-bold text-base">{patientData.patientId}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-xs">DATE OF BIRTH</h3>
              <p className="font-bold text-base">{patientData.birthDate}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-xs">BLOOD GROUP</h3>
              <p className="font-bold text-base text-red-600">{patientData.bloodGroup}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-xs">PHONE</h3>
              <p className="font-bold text-base">{patientData.phoneNo}</p>
            </div>
            <div>
              <h3 className="text-gray-500 text-xs">EMAIL</h3>
              <p className="font-bold text-base">{patientData.email}</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-gray-500 text-xs">ADDRESS</h3>
              <p className="font-bold text-base">{patientData.address}</p>
            </div>
            <div className="col-span-2">
              <h3 className="text-gray-500 text-xs">EMERGENCY CONTACT</h3>
              <p className="font-bold text-base">{patientData.emergencyContact}</p>
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="mt-4">
          <div className="flex items-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-1 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
            <h2 className="text-lg font-bold">Medical Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Allergies */}
            <div className="bg-red-50 p-3 rounded">
              <div className="flex items-center mb-1">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </div>
                <h3 className="text-red-700 font-bold text-sm">Allergies</h3>
              </div>
              <p className="text-red-800 text-sm">
                {patientData.allergies.join(', ')}
              </p>
            </div>

            {/* Current Medications */}
            <div className="bg-yellow-50 p-3 rounded">
              <div className="flex items-center mb-1">
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white mr-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 className="text-yellow-700 font-bold text-sm">Current Medications</h3>
              </div>
              <p className="text-yellow-800 text-sm">
                {patientData.currentMedications.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-2 border-t flex justify-between items-center text-xs text-gray-500">
        <div>Last Updated: {patientData.registeredDate}</div>
        <div>Card ID: NC-{new Date().getFullYear()}-001</div>
      </div>
    </div>
  );
}

export default PatientProfile;