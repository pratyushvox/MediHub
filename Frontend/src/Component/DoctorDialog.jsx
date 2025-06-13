import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

const DoctorDialog = ({ user, onClose }) => {
  const [imageError, setImageError] = useState(false);

  // Function to get initials from name
  const getInitials = (name) => {
    if (!name) return 'DR';
    const names = name.split(' ');
    let initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
      initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
  };

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="min-h-screen inset-0 absolute bg-gray-600 bg-opacity-30 backdrop-blur-[0.5px] p-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white p-6 rounded-md">
        {/* Header with close button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Doctor Profile</h1>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Doctor Card with all information */}
        <div className="bg-white rounded-lg">
          {/* Card Header */}
          <div className="flex items-center p-4 border-b">
            <div className="bg-gray-100 rounded-full p-2 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium">Doctor Card</h2>
          </div>

          {/* Basic Doctor Information */}
          <div className="p-6 flex">
            <div className="mr-6">
              {user.profilePic && !imageError ? (
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                  onError={handleImageError}
                />
              ) : (
                <div className="bg-purple-500 rounded-full w-24 h-24 flex items-center justify-center text-white text-3xl font-bold">
                  {getInitials(user.name)}
                </div>
              )}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-500 text-sm mb-1">FULL NAME</p>
                <p className="font-bold text-lg">{user.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">DOCTOR ID</p>
                <p className="font-bold">{user.doctorId || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">Available Time</p>
                <p>{user.availableTime || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">EXPERIENCE</p>
                <p>{user.experience || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">PHONE</p>
                <p>{user.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">EMAIL</p>
                <p>{user.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-1">ADDRESS</p>
                <p>{user.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className="px-6 pb-6">
            <div className="border-t pt-4">
              <div className="flex items-center mb-4">
                <ArrowRight className="w-5 h-5 text-blue-500 mr-2" />
                <h2 className="text-lg font-medium">Professional Information</h2>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="bg-red-500 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-red-500">Specialties</h3>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {user.specialist || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-yellow-600">Degree</h3>
                  </div>
                  <p>{user.degree || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDialog;