import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { baseUrl } from '../../Constant/Constant';

function DoctorProfile({ onClose }) {
  const [doctorData, setDoctorData] = useState(null); // State to store the fetched doctor data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle errors

  useEffect(() => {
    // Fetch doctor data from the backend
    const fetchDoctorData = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId'); // Get doctorId from localStorage
        if (!doctorId) {
          throw new Error('Doctor ID not found in localStorage');
        }

        const response = await fetch(`${baseUrl}doctor/${doctorId}`); // Fetch data
        if (!response.ok) {
          throw new Error('Failed to fetch doctor data');
        }

        const data = await response.json(); // Parse JSON response
        setDoctorData(data); // Set the fetched data to state
      } catch (err) {
        setError(err.message); // Set error message
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchDoctorData(); // Call the fetch function
  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    return <div className="text-center py-4">Loading...</div>; // Show loading state
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>; // Show error state
  }

  if (!doctorData) {
    return <div className="text-center py-4">No data found</div>; // Handle case where no data is fetched
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-3xl w-full">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Doctor Profile</h1>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Doctor Card with all information */}
        <div className="bg-white shadow-md rounded-lg">
          {/* Card Header */}
          <div className="flex items-center p-4 border-b">
            <div className="bg-gray-100 rounded-full p-2 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium">Doctor Card</h2>
            <div className="ml-auto">
              <X className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Basic Doctor Information */}
          <div className="p-6 flex">
            {/* Doctor Avatar */}
            <div className="mr-6">
              <div className="bg-purple-500 rounded-full w-24 h-24 flex items-center justify-center text-white text-3xl font-bold">
                {doctorData.name?.charAt(0) || 'D'} {/* Display the first letter of the doctor's name */}
              </div>
            </div>

            {/* Doctor Information */}
            <div className="flex-1 grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm mb-1">FULL NAME</p>
                <p className="font-bold text-lg">{doctorData.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">DOCTOR ID</p>
                <p className="font-bold">{doctorData._id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Available Time</p>
                <p>{doctorData.availableTime || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">EXPERIENCE</p>
                <p>{doctorData.experience || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">PHONE</p>
                <p>{doctorData.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">EMAIL</p>
                <p>{doctorData.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">ADDRESS</p>
                <p>{doctorData.address || 'N/A'}</p>
              </div>
              
            </div>
          </div>

          {/* Professional Information Section - inside the same card */}
          <div className="px-6 pb-6">
            <div className="border-t pt-4">
              <div className="flex items-center mb-4">
                <ArrowRight className="w-5 h-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-medium">Professional Information</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Specialties Section */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="bg-red-500 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-red-500">Specialties</h3>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {doctorData.specialist || 'N/A'}
                    </span>
                  </div>
                </div>
                
                {/* Qualifications Section */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-yellow-600">Degree</h3>
                  </div>
                  <p>{doctorData.degree || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer with last updated information */}
          
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;