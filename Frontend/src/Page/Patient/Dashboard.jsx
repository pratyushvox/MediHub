import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Settings, Bell, ClipboardList, Calendar, FlaskRound as Flask, Pill, Bell as BellIcon } from "lucide-react";
import Sidebar from "../../Component/Sidebar";
import { Card } from "../../component/Card";
import Box from "../../Component/Box";
import HealthOverview from "../../Component/Overview";
import PatientNavbar from "../../Component/Patientnavbar";
import RemindersModal from "../../Component/Remindermodal";
import PrescriptionModal from "../../Component/Prescriptionmodel";

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fullName, setFullName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [showRemindersModal, setShowRemindersModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [loading, setLoading] = useState({
    appointments: true,
    labResults: true,
    userDetails: true
  });
  const storedUserId = localStorage.getItem("Userid");
  const userId = id || storedUserId;

  useEffect(() => {
    if (!userId) return;

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/users/${userId}`);
        const data = await response.json();
        setFullName(data.name);
        setLoading(prev => ({ ...prev, userDetails: false }));
        
        // Fetch lab results using patientId from user details
        if (data.patientId) {
          fetchLabResults(data.patientId);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setLoading(prev => ({ ...prev, userDetails: false }));
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/appointments/getAppointment`);
        const data = await response.json();
        // Filter appointments for the current patient
        const patientAppointments = Array.isArray(data) ? 
          data.filter(appt => appt.bookedPatient?._id === userId) : 
          [];
        setAppointments(patientAppointments);
        setLoading(prev => ({ ...prev, appointments: false }));
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setLoading(prev => ({ ...prev, appointments: false }));
      }
    };

    const fetchLabResults = async (patientId) => {
      try {
        const response = await fetch(`http://localhost:4000/api/patient/labresult/${patientId}`);
        const data = await response.json();
        if (data.success) {
          setLabResults(data.data || []);
        }
        setLoading(prev => ({ ...prev, labResults: false }));
      } catch (error) {
        console.error("Error fetching lab results:", error);
        setLoading(prev => ({ ...prev, labResults: false }));
      }
    };

    fetchUserDetails();
    fetchAppointments();
  }, [userId]);

  // Get upcoming appointment (next one in the future)
  const getUpcomingAppointment = () => {
    if (!appointments.length) return null;
    
    const now = new Date();
    const upcoming = appointments
      .filter(appt => {
        const apptDate = new Date(appt.appointmentDate);
        return apptDate >= now && appt.consultationStatus !== "completed";
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];
    
    return upcoming || null;
  };

  // Count total appointments
  const totalAppointments = appointments.length;
  
  // Count online meetings (appointments with type "Online")
  const totalOnlineMeetings = appointments.filter(
    appt => appt.appointmentType === "Online"
  ).length;

  // Count pending appointments
  const pendingAppointments = appointments.filter(
    appt => appt.consultationStatus === "pending"
  ).length;

  // Count completed appointments
  const completedAppointments = appointments.filter(
    appt => appt.consultationStatus === "completed"
  ).length;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const upcomingAppointment = getUpcomingAppointment();
  const recentLabResult = labResults.length > 0 ? labResults[0] : null;

  if (loading.userDetails || loading.appointments || loading.labResults) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
        <div className="pt-16 p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0367A5]">Patient Dashboard</h1>
              <p className="text-gray-600 text-lg">
                Welcome back, {fullName || "User"}! Here's your health overview.
              </p>
            </div>
            <button
              className="px-4 py-2 bg-[#0367A5] text-white rounded-lg flex items-center gap-2 hover:bg-[#024e7a] transition"
              onClick={() => navigate(`/Patient/BookAppointment`)}
            >
              <span className="text-xl text-white">➕</span> Book Appointment
            </button>
          </div>

          {/* Boxes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Box
              icon={<Calendar className="text-[#0367A5]" />}
              count={totalAppointments}
              label="Total Appointments"
              className="bg-white"
              onClick={() => navigate(`/patient/${userId}/appointments`)}
            />
            <Box
              icon={<ClipboardList className="text-[#3CB5AC]" />}
              count={totalOnlineMeetings}
              label="Online Meetings"
              className="bg-white"
              onClick={() => navigate(`/patient/${userId}/online-meetings`)}
            />
            <Box
              icon={<Pill className="text-[#70CFC5]" />}
              count={pendingAppointments}
              label="Pending Appointments"
              className="bg-white"
              onClick={() => navigate(`/patient/${userId}/appointments`)}
            />
            <Box
              icon={<Flask className="text-[#70CFC5]" />}
              count={labResults.length}
              label="Lab Tests"
              className="bg-white"
              onClick={() => navigate(`/patient/${userId}/labresults`)}
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
                  {upcomingAppointment ? (
                    <>
                      <div className="text-xl font-bold">
                        {formatDate(upcomingAppointment.appointmentDate)}
                      </div>
                      <div className="text-gray-600 flex items-center gap-2 mt-2">
                        <span>
                          {upcomingAppointment.appointmentTime} - Dr. {upcomingAppointment.bookedDoctor?.name}
                        </span>
                      </div>
                      <div className="mt-4">
                        <span className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm">
                          {upcomingAppointment.appointmentReason}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 h-full flex items-center justify-center">
                      No upcoming appointments
                    </div>
                  )}
                </div>
                <button 
                  className="text-blue-600 hover:underline w-full text-center bg-blue-50 py-2 rounded-md"
                  onClick={() => navigate(`/patient/viewappointments`)}
                >
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
                  {recentLabResult ? (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{recentLabResult.testType}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          recentLabResult.reportStatus === "Normal" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {recentLabResult.reportStatus}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {formatDate(recentLabResult.date)}
                      </div>
                      <div className="text-sm mb-1">
                        <span className="font-medium">Doctor:</span> {recentLabResult.referringDoctor}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Findings:</span> {recentLabResult.findings}
                      </div>
                      {recentLabResult.parameters?.length > 0 && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium">Parameters:</div>
                          <div className="flex justify-between">
                            <span>{recentLabResult.parameters[0].parameter}</span>
                            <span>{recentLabResult.parameters[0].result}</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-500 h-full flex items-center justify-center">
                      No lab results available
                    </div>
                  )}
                </div>
                <button 
                  className="text-green-600 hover:underline w-full text-center bg-green-50 py-2 rounded-md"
                  onClick={() => navigate(`/Patient/Labreport`)}
                >
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
                  {appointments.filter(a => a.consultationStatus === "completed").length > 0 ? (
                    <>
                      {(() => {
                        const completedAppointments = appointments
                          .filter(a => a.consultationStatus === "completed")
                          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                        
                        const mostRecentCompleted = completedAppointments[0];
                        
                        return (
                          <>
                            <div className="text-sm font-medium mb-1">
                              Last Consultation Notes:
                            </div>
                            {mostRecentCompleted.consultationNotes ? (
                              <div className="text-sm text-gray-700 mb-2 line-clamp-3">
                                {mostRecentCompleted.consultationNotes}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500 italic mb-2">
                                No consultation notes available
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              With Dr. {mostRecentCompleted.bookedDoctor?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(mostRecentCompleted.appointmentDate)}
                            </div>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <div className="text-gray-500 h-full flex items-center justify-center">
                      No completed consultations yet
                    </div>
                  )}
                </div>
                <button 
  className="text-red-600 hover:underline w-full text-center bg-red-50 py-2 rounded-md"
  onClick={() => setShowPrescriptionModal(true)}
>
  View All Prescriptions
</button>


{showPrescriptionModal && (
  <PrescriptionModal
    isOpen={showPrescriptionModal}
    onClose={() => setShowPrescriptionModal(false)}
    appointments={appointments}
  />
)}
              </div>
            </Card>

            <Card
  title="Health Reminders"
  icon={<div className="bg-purple-100 p-2 rounded-full"><BellIcon className="w-6 h-6 text-purple-500" /></div>}
>
  <div className="h-[200px] flex flex-col">
    <div className="flex-1">
      {(() => {
        // Get the most recent activity (appointment or lab result)
        const now = new Date();
        
        // Get upcoming appointment if exists
        const upcomingAppt = upcomingAppointment;
        
        // Get most recent lab result if exists
        const recentLab = labResults.length > 0 
          ? labResults.sort((a, b) => new Date(b.date) - new Date(a.date))[0] 
          : null;
        
        // Determine which is more recent/relevant
        if (upcomingAppt && recentLab) {
          const daysToAppt = Math.floor(
            (new Date(upcomingAppt.appointmentDate) - now) / (1000 * 60 * 60 * 24)
          );
          const daysSinceLab = Math.floor(
            (now - new Date(recentLab.date)) / (1000 * 60 * 60 * 24)
          );
          
          // If appointment is within 3 days, prioritize showing that
          if (daysToAppt <= 3) {
            return (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Upcoming Appointment</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                    {daysToAppt === 0 ? 'Today' : `In ${daysToAppt} day${daysToAppt !== 1 ? 's' : ''}`}
                  </span>
                </div>
                <div className="text-sm mb-1">
                  <span className="font-medium">With:</span> Dr. {upcomingAppt.bookedDoctor?.name}
                </div>
                <div className="text-sm mb-1">
                  <span className="font-medium">When:</span> {formatDate(upcomingAppt.appointmentDate)} at {upcomingAppt.appointmentTime}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Reason:</span> {upcomingAppt.appointmentReason}
                </div>
              </>
            );
          } 
          // Otherwise show the lab result if it's recent (within 7 days)
          else if (daysSinceLab <= 7) {
            return (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Recent Lab Result</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    recentLab.reportStatus === "Normal" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {recentLab.reportStatus}
                  </span>
                </div>
                <div className="text-sm mb-1">
                  <span className="font-medium">Test:</span> {recentLab.testType}
                </div>
                <div className="text-sm mb-1">
                  <span className="font-medium">Date:</span> {formatDate(recentLab.date)}
                </div>
                {recentLab.reportStatus !== "Normal" ? (
                  <div className="text-sm text-red-600 font-medium mt-2">
                    Abnormal result - Please consult your doctor
                  </div>
                ) : (
                  <div className="text-sm text-green-600 font-medium mt-2">
                    Normal result - Keep up the good health!
                  </div>
                )}
              </>
            );
          }
        }
        
        // Default cases
        if (upcomingAppt) {
          const daysToAppt = Math.floor(
            (new Date(upcomingAppt.appointmentDate) - now) / (1000 * 60 * 60 * 24)
          );
          return (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Upcoming Appointment</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  {daysToAppt === 0 ? 'Today' : `In ${daysToAppt} day${daysToAppt !== 1 ? 's' : ''}`}
                </span>
              </div>
              <div className="text-sm mb-1">
                <span className="font-medium">With:</span> Dr. {upcomingAppt.bookedDoctor?.name}
              </div>
              <div className="text-sm mb-1">
                <span className="font-medium">When:</span> {formatDate(upcomingAppt.appointmentDate)} at {upcomingAppt.appointmentTime}
              </div>
              <div className="text-sm">
                <span className="font-medium">Reason:</span> {upcomingAppt.appointmentReason}
              </div>
            </>
          );
        }
        
        if (recentLab) {
          return (
            <>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Recent Lab Result</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  recentLab.reportStatus === "Normal" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {recentLab.reportStatus}
                </span>
              </div>
              <div className="text-sm mb-1">
                <span className="font-medium">Test:</span> {recentLab.testType}
              </div>
              <div className="text-sm mb-1">
                <span className="font-medium">Date:</span> {formatDate(recentLab.date)}
              </div>
              {recentLab.reportStatus !== "Normal" ? (
                <div className="text-sm text-red-600 font-medium mt-2">
                  Abnormal result - Please consult your doctor
                </div>
              ) : (
                <div className="text-sm text-green-600 font-medium mt-2">
                  Normal result - Keep up the good health!
                </div>
              )}
            </>
          );
        }
        
        return (
          <div className="text-gray-500 h-full flex items-center justify-center">
            No health reminders currently
          </div>
        );
      })()}
    </div>
    <button 
  className="text-purple-600 hover:underline w-full text-center bg-purple-50 py-2 rounded-md"
  onClick={() => setShowRemindersModal(true)}
>
  View All Reminders
</button>
  </div>
  {showRemindersModal && (
    <RemindersModal
      isOpen={showRemindersModal}
      onClose={() => setShowRemindersModal(false)}
      appointments={appointments}
      labResults={labResults}
      userId={userId}
    />
  )}
</Card>

          </div>
        </div>
        <HealthOverview 
          appointments={appointments}
          labResults={labResults}
          userId={userId}
        />


      </div>
    
    </div>
    
  );
  
  
};

export default PatientDashboard;