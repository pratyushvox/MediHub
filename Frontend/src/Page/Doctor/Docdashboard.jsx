import React, { useState, useEffect } from 'react';
import { Calendar, Video, Users, Clock, Settings } from 'lucide-react';
import Box from '../../Component/Box';
import DoctorProfile from './Doctorprofile'; // Import the DoctorProfile component
import Editdocprofile from '../Doctor/Editdocprofile'; // Import the EditProfile component
import { useNavigate } from 'react-router-dom';


// Example data for appointments
const appointments = [
  { time: '8:00Am', patientName: 'Sameer Shrestha', condition: 'Head pain', status: 'completed' },
  { time: '9:00Am', patientName: 'Anita Rai', condition: 'Stomach ache', status: 'cancelled' },
  { time: '10:00Am', patientName: 'Raj Shrestha', condition: 'Fever', status: 'completed' },
  { time: '11:00Am', patientName: 'Nina Adhikari', condition: 'Back pain', status: 'pending' },
  { time: '12:00Pm', patientName: 'Hari Bhandari', condition: 'Cough', status: 'pending' },
];

function Doctordash() {
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State to control the DoctorProfile modal visibility
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false); // State to control the EditProfile modal visibility
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State to control the settings dropdown visibility
  const [doctorData, setDoctorData] = useState(null); // State to store the fetched doctor data
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State to handle errors
  const navigate = useNavigate();

  // Fetch doctor data from the API
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId'); // Get doctorId from localStorage
        if (!doctorId) {
          throw new Error('Doctor ID not found in localStorage');
        }

        const response = await fetch(`http://localhost:4000/api/doctor/${doctorId}`); // Fetch data
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

  const openProfileModal = () => {
    setIsProfileOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileOpen(false);
  };

  const openEditProfileModal = () => {
    setIsEditProfileOpen(true);
    setIsSettingsOpen(false); // Close the settings dropdown
  };

  const closeEditProfileModal = () => {
    setIsEditProfileOpen(false);
  };

  const toggleSettingsDropdown = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleLogout = () => {
    // Handle logout action
    localStorage.removeItem('doctorId'); // Clear doctorId from localStorage
    navigate('/doctor/login'); // Navigate to the login page
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>; // Show loading state
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>; // Show error state
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with profile */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Welcome Dr {doctorData?.name || 'User'}!</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  onClick={toggleSettingsDropdown}
                >
                  <Settings className="w-6 h-6 text-gray-600" />
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={openEditProfileModal} // Open the EditProfile modal
                    >
                      Edit Profile
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout} // Call handleLogout on click
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <button
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                onClick={openProfileModal} // Open the profile modal
              >
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop"
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">Dr. {doctorData?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{doctorData?.specialist || 'Specialist'}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for DoctorProfile */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-5 max-w-2xl">
            <DoctorProfile onClose={closeProfileModal} /> {/* Pass the close function as a prop */}
          </div>
        </div>
      )}

      {/* Modal for EditProfile */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-5 max-w-2xl">
            <Editdocprofile onClose={closeEditProfileModal} /> {/* Pass the close function as a prop */}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Using the Box component for different sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Box 
            icon={<Calendar />} 
            count={50} 
            label="Appointments" 
            className="bg-[#2A7982] text-white"
            onClick={() => console.log('Appointments clicked')}
          />
          <Box 
            icon={<Video />} 
            count={50} 
            label="Consultancy" 
            className="bg-[#357BA6] text-white"
            onClick={() => console.log('Consultancy clicked')}
          />
          <Box 
            icon={<Users />} 
            count={50} 
            label="Pending" 
            className="bg-[#5C9ECB] text-white"
            onClick={() => console.log('Pending clicked')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's List */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Today's List</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">24</span>
            </div>
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt={appointment.patientName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{appointment.patientName}</p>
                      <p className="text-xs text-gray-500">{appointment.condition}</p>
                    </div>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${appointment.status === 'completed' ? 'bg-green-400' : appointment.status === 'cancelled' ? 'bg-red-400' : 'bg-yellow-400'}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* On Going Appointment */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">On Going Appointment</h2>
              <span className="text-sm text-gray-500">8:00Am-9:00Am</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Patient"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-sm font-medium">Sameer Shrestha</p>
                <p className="text-xs text-gray-500">Head pain</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <input type="text" className="w-full p-2 border rounded-md text-sm" placeholder="22 yrs old, Male" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <input type="text" className="w-full p-2 border rounded-md text-sm" placeholder="antibiotics" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Problem</label>
                  <input type="text" className="w-full p-2 border rounded-md text-sm" placeholder="pain in upper stomach region" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Notes</label>
                <textarea className="w-full p-2 border rounded-md text-sm h-24" placeholder="Type..." />
              </div>
              <button className="w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 transition-colors">
                Finish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Doctordash;