import React, { useState, useEffect } from 'react';
import { Calendar, Video, Users, Clock, Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Box from '../../Component/Box';
import DoctorProfile from './Doctorprofile';
import Editdocprofile from '../Doctor/Editdocprofile';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../Component/Sidebar';
import { toast } from "react-toastify";

function Doctordash() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [doctorData, setDoctorData] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  // Add a new state to track if an update is in progress
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const doctorId = localStorage.getItem('doctorId');
      if (!doctorId) {
        throw new Error('Doctor ID not found in localStorage');
      }

      // Fetch doctor data
      const doctorResponse = await fetch(`http://localhost:4000/api/doctor/${doctorId}`);
      if (!doctorResponse.ok) {
        throw new Error('Failed to fetch doctor data');
      }
      const doctorData = await doctorResponse.json();
      setDoctorData(doctorData);

      // Fetch appointments
      const appointmentsResponse = await fetch('http://localhost:4000/api/appointments/getAppointment');
      if (!appointmentsResponse.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const appointmentsData = await appointmentsResponse.json();
      
      // Filter all appointments for this doctor and approved by admin
      const allApprovedAppointments = appointmentsData
        .filter(appt => 
          appt.bookedDoctor?._id === doctorId && 
          appt.approvedByAdmin === "Accepted"
        );
      
      setAllAppointments(allApprovedAppointments);

      // Filter today's appointments
      const today = new Date().toISOString().split('T')[0];
      const todaysFilteredAppointments = allApprovedAppointments
        .filter(appt => appt.appointmentDate === today)
        .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
      
      setTodaysAppointments(todaysFilteredAppointments);
      
      // Set the first appointment as selected by default if available
      if (todaysFilteredAppointments.length > 0) {
        setSelectedAppointment(todaysFilteredAppointments[0]);
        setNotes(todaysFilteredAppointments[0].consultationNotes || '');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update consultation notes
  const updateConsultationNotes = async () => {
    if (!selectedAppointment || notes === selectedAppointment.consultationNotes) {
      return; // Skip if no changes or no appointment selected
    }
    
    try {
      setIsUpdating(true); // Set updating flag
      
      const response = await fetch(
        `http://localhost:4000/api/appointments/${selectedAppointment._id}/ConsultationStatusandNotes`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doctorId: localStorage.getItem('doctorId'),
            consultationNotes: notes
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }
      
      // Instead of trying to update state with the response,
      // simply show success toast and then refresh data
      toast.success('Notes updated successfully!');
      
      // Refresh all data to ensure consistency
      await fetchData();
      
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error(error.message || 'Failed to update notes');
    } finally {
      setIsUpdating(false); // Clear updating flag
    }
  };

  // Complete consultation
  const completeConsultation = async () => {
    if (!selectedAppointment) {
      toast.error("No appointment selected");
      return;
    }
    
    if (getAppointmentStatus(selectedAppointment) === 'completed') {
      toast.info("This consultation is already completed");
      return;
    }
    
    try {
      setIsUpdating(true); // Set updating flag
      
      const response = await fetch(
        `http://localhost:4000/api/appointments/${selectedAppointment._id}/ConsultationStatusandNotes`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doctorId: localStorage.getItem('doctorId'),
            consultationStatus: 'completed',
            consultationNotes: notes
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to complete consultation');
      }
      
      toast.success('Consultation marked as completed!');
      
      // Refresh all data to ensure consistency
      await fetchData();
      
    } catch (error) {
      console.error('Error completing consultation:', error);
      toast.error(error.message || 'Failed to complete consultation');
    } finally {
      setIsUpdating(false); // Clear updating flag
    }
  };

  // Handle appointment selection
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.consultationNotes || '');
  };

  // Status icon component
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
  };

  // Helper function to determine appointment status
  const getAppointmentStatus = (appointment) => {
    return appointment.consultationStatus || 'pending';
  };

  const openProfileModal = () => {
    setIsProfileOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileOpen(false);
  };

  const openEditProfileModal = () => {
    setIsEditProfileOpen(true);
    setIsSettingsOpen(false);
  };

  const closeEditProfileModal = () => {
    setIsEditProfileOpen(false);
  };

  const toggleSettingsDropdown = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorId');
    navigate('/doctor/login');
  };

  if (loading || isUpdating) {
    return (
      <div className="flex min-h-screen bg-gray-100 justify-center items-center">
        <div className="text-center py-4 flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-2" />
          <p className="text-gray-700">{isUpdating ? 'Updating...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100 justify-center items-center">
        <div className="text-center py-4 text-red-500">
          <AlertCircle className="w-10 h-10 mb-2 mx-auto" />
          <p>Error: {error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
            onClick={fetchData}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar role="doctor" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with profile */}
        <div className="bg-white shadow-sm">
          <div className="px-8 py-4">
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
                        onClick={openEditProfileModal}
                      >
                        Edit Profile
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  onClick={openProfileModal}
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
              <DoctorProfile onClose={closeProfileModal} />
            </div>
          </div>
        )}

        {/* Modal for EditProfile */}
        {isEditProfileOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-5 max-w-2xl">
              <Editdocprofile onClose={closeEditProfileModal} />
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 overflow-auto p-8">
          {/* Using the Box component for different sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Box 
              icon={<Calendar />} 
              count={allAppointments.length} 
              label="Total Appointments" 
              className="bg-[#2A7982] text-white"
            />
            <Box 
              icon={<Video />} 
              count={allAppointments.filter(a => a.appointmentType === 'Online Consultation').length} 
              label="Total Online Consultations" 
              className="bg-[#357BA6] text-white"
            />
            <Box 
              icon={<Users />} 
              count={allAppointments.filter(a => getAppointmentStatus(a) === 'pending').length} 
              label="Pending Consultations"
              className="bg-[#5C9ECB] text-white"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's List */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Today's Appointments</h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {todaysAppointments.length}
                </span>
              </div>
              <div className="space-y-4">
                {todaysAppointments.length > 0 ? (
                  todaysAppointments.map((appointment, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between gap-3 p-4 rounded-lg shadow-sm hover:shadow-md transition-colors cursor-pointer ${
                        selectedAppointment?._id === appointment._id 
                          ? 'bg-teal-100 border border-teal-300' 
                          : 'bg-gray-50'
                      }`}
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">{appointment.appointmentTime}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          alt={appointment.bookedPatient.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{appointment.bookedPatient.name}</p>
                          <p className="text-xs text-gray-500">{appointment.appointmentReason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <StatusIcon status={getAppointmentStatus(appointment)} />
                        <span className="text-xs text-gray-500 capitalize">
                          {getAppointmentStatus(appointment)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">No appointments for today</div>
                )}
              </div>
            </div>

            {/* Selected Appointment Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              {selectedAppointment ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Appointment Details</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {selectedAppointment.appointmentTime}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        getAppointmentStatus(selectedAppointment) === 'completed' ? 'bg-green-100 text-green-800' : 
                        getAppointmentStatus(selectedAppointment) === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getAppointmentStatus(selectedAppointment)}
                      </span>
                    </div>
                  </div>

                  {/* Payment status */}
                  {selectedAppointment.payment && (
                    <div className="mb-4 text-sm font-medium">
                      Payment: <span className={selectedAppointment.payment.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}>
                        {selectedAppointment.payment.status}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-6">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt="Patient"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium">{selectedAppointment.bookedPatient.name}</p>
                      <p className="text-xs text-gray-500">{selectedAppointment.appointmentType}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Patient Details</label>
                      <div className="p-2 border rounded-md text-sm bg-gray-50">
                        {selectedAppointment.bookedPatient.personalinfo.age} years old, 
                        {selectedAppointment.bookedPatient.personalinfo.gender}, 
                        Blood Group: {selectedAppointment.bookedPatient.personalinfo.bloodGroup}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                        <div className="p-2 border rounded-md text-sm bg-gray-50">
                          {selectedAppointment.bookedPatient.personalinfo.allergies || 'None'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                        <div className="p-2 border rounded-md text-sm bg-gray-50">
                          {selectedAppointment.bookedPatient.personalinfo.medicalConditions || 'None'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Reason</label>
                      <div className="p-2 border rounded-md text-sm bg-gray-50">
                        {selectedAppointment.appointmentReason}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Notes</label>
                      <textarea 
                        className="w-full p-2 border rounded-md text-sm h-24" 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={isUpdating}
                        placeholder="Add your consultation notes here..."
                      />
                      {/* Add a save button instead of using onBlur */}
                      <button
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-400"
                        onClick={updateConsultationNotes}
                        disabled={isUpdating || notes === selectedAppointment.consultationNotes}
                      >
                        Save Notes
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button
                        className={`flex-1 py-2 rounded-md transition-colors ${
                          getAppointmentStatus(selectedAppointment) === 'completed' || isUpdating
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-teal-500 text-white hover:bg-teal-600'
                        }`}
                        onClick={completeConsultation}
                        disabled={getAppointmentStatus(selectedAppointment) === 'completed' || isUpdating}
                      >
                        {getAppointmentStatus(selectedAppointment) === 'completed'
                          ? 'Consultation Completed'
                          : 'Complete Consultation'}
                      </button>
                      <button 
                        className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                        disabled={isUpdating}
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {todaysAppointments.length > 0 
                    ? "Select an appointment to view details" 
                    : "No appointments available for today"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Doctordash;