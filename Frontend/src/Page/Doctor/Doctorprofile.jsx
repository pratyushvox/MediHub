import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { baseUrl } from '../../Constant/Constant';

function DoctorProfile({ onClose }) {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId');
        if (!doctorId) {
          throw new Error('Doctor ID not found in localStorage');
        }

        const response = await fetch(`${baseUrl}doctor/${doctorId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch doctor data: ${response.status}`);
        }

        const data = await response.json();
        setDoctorData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching doctor data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      console.warn('No onClose handler provided to DoctorProfile');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-500">Error</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={handleClose}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">No Data Found</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="mb-4">Could not find doctor information.</p>
          <button
            onClick={handleClose}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Doctor Profile</h1>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Doctor Card with all information */}
        <div className="p-6">
          {/* Basic Information Section */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Doctor Avatar */}
            <div className="flex-shrink-0">
              <div className="bg-purple-500 rounded-full w-24 h-24 flex items-center justify-center text-white text-3xl font-bold">
                {doctorData.name?.charAt(0) || 'D'}
              </div>
            </div>

            {/* Doctor Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
              <InfoField label="FULL NAME" value={doctorData.name} />
              <InfoField label="DOCTOR ID" value={doctorData.doctorId} />
              <InfoField label="AVAILABLE TIME" value={doctorData.availableTime} />
              <InfoField label="EXPERIENCE" value={doctorData.experience} />
              <InfoField label="PHONE" value={doctorData.phone} />
              <InfoField label="EMAIL" value={doctorData.email} />
              <InfoField label="ADDRESS" value={doctorData.address} />
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="border-t pt-6">
            <div className="flex items-center mb-6">
              <ArrowRight className="w-5 h-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-medium">Professional Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Specialties Card */}
              <InfoCard 
                title="Specialties" 
                icon={<X className="w-4 h-4 text-white" />}
                iconBg="bg-red-500"
                cardBg="bg-red-50"
                titleColor="text-red-500"
              >
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-white rounded-full text-sm shadow-sm">
                    {doctorData.specialist || 'N/A'}
                  </span>
                </div>
              </InfoCard>
              
              {/* Qualifications Card */}
              <InfoCard 
                title="Degree" 
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                iconBg="bg-yellow-500"
                cardBg="bg-yellow-50"
                titleColor="text-yellow-600"
              >
                <p className="text-gray-700">{doctorData.degree || 'N/A'}</p>
              </InfoCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable InfoField component
function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm mb-1">{label}</p>
      <p className="font-medium text-gray-800 break-words">{value || 'N/A'}</p>
    </div>
  );
}

// Reusable InfoCard component
function InfoCard({ title, icon, iconBg, cardBg, titleColor, children }) {
  return (
    <div className={`${cardBg} p-4 rounded-lg`}>
      <div className="flex items-center mb-3">
        <div className={`${iconBg} rounded-full w-6 h-6 flex items-center justify-center mr-2`}>
          {icon}
        </div>
        <h3 className={`text-lg font-medium ${titleColor}`}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default DoctorProfile;