"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, ChevronRight, Activity } from "lucide-react";

export default function HealthDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("Userid");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/appointments/getAppointment`);
        const data = await response.json();
        
        // Filter appointments for the current patient
        const patientAppointments = Array.isArray(data) ? 
          data.filter(appt => appt.bookedPatient?._id === userId) : 
          [];
          
        setAppointments(patientAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const upcomingAppointment = getUpcomingAppointment();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#0367A3]">Overview</h1>
        <p className="text-[#0367A3]/80">Your health summary and recent activities</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointments Summary */}
        <div className="border rounded-lg p-6 bg-[#B1E1DE] shadow-md">
          <div className="flex items-center gap-2 pb-3 border-b border-[#0367A3]/40">
            <Clock className="h-5 w-5 text-[#0367A3]" />
            <h3 className="font-medium text-[#0367A3]">Appointments Summary</h3>
          </div>
          <p className="text-sm text-[#0367A3]/80 mt-2">Your upcoming and past appointments</p>
          
          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0367A3]"></div>
              </div>
            ) : upcomingAppointment ? (
              <div className="flex gap-4">
                <div className="bg-[#0367A3]/10 rounded-full p-3 h-12 w-12 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#0367A3]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#0367A3]">Upcoming Appointment</h4>
                  <p className="text-sm text-[#0367A3]/80">
                    {formatDate(upcomingAppointment.appointmentDate)} • {upcomingAppointment.appointmentTime}
                  </p>
                  <p className="text-sm text-[#0367A3]/90">
                    Dr. {upcomingAppointment.bookedDoctor?.name} • <span className="text-[#0367A3]">{upcomingAppointment.appointmentReason}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="bg-[#0367A3]/10 rounded-full p-3 h-12 w-12 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#0367A3]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#0367A3]">No Upcoming Appointments</h4>
                  <p className="text-sm text-[#0367A3]/80">You don't have any scheduled appointments</p>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="w-full flex items-center justify-center py-2 mt-4 text-[#0367A3] hover:bg-[#0367A3]/10 rounded-md transition-colors"
            onClick={() => window.location.href = "/patient/viewappointments"}
          >
            <span>View All Appointments</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        {/* Recent Activity */}
        <div className="border rounded-lg p-6 bg-white shadow-md">
          <div className="flex items-center gap-2 pb-3 border-b border-[#0367A3]/40">
            <Activity className="h-5 w-5 text-[#0367A3]" />
            <h3 className="font-medium text-[#0367A3]">Recent Activity</h3>
          </div>
          <p className="text-sm text-[#0367A3]/80 mt-2">Your recent health-related activities</p>
          
          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0367A3]"></div>
              </div>
            ) : appointments.length > 0 ? (
              // Display most recent appointment activity
              <div className="flex gap-4">
                <div className="bg-[#0367A3]/10 rounded-full p-3 h-12 w-12 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#0367A3]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#0367A3]">
                    {appointments[0].consultationStatus === "completed" ? "Appointment Completed" : "Appointment Scheduled"}
                  </h4>
                  <p className="text-sm">
                    {appointments[0].appointmentReason} with Dr. {appointments[0].bookedDoctor?.name}
                  </p>
                  <p className="text-sm text-[#0367A3]/80">{formatDate(appointments[0].appointmentDate)}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <div className="bg-[#0367A3]/10 rounded-full p-3 h-12 w-12 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#0367A3]" />
                </div>
                <div>
                  <h4 className="font-medium text-[#0367A3]">No Recent Activity</h4>
                  <p className="text-sm">You don't have any recent health activities</p>
                </div>
              </div>
            )}
          </div>
          
          <button className="w-full flex items-center justify-center py-2 mt-4 text-[#0367A3] hover:bg-[#0367A3]/10 rounded-md transition-colors">
            
          
          </button>
        </div>
      </div>
    </div>
  );
}