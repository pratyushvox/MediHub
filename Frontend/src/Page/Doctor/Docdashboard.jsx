import React from 'react';
import { Calendar, Video, Users, Clock, Settings } from 'lucide-react';
import Box from '../../Component/Box';
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
  const navigate = useNavigate(); 
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with profile */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Welcome Dr Simpal!</h1>
            <div className="flex items-center gap-4">
              <Settings className="w-6 h-6 text-gray-600" />
              <button
                className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                onClick={() => navigate('/doctor/profile')} // Navigate to DoctorProfile
              >
                <img
                  src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop"
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">Dr. Simpal</p>
                  <p className="text-xs text-gray-500">Cardiologist</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

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