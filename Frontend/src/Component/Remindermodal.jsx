import React, { useState } from 'react';
import { X, Calendar, FlaskRound as Flask, ChevronLeft, ChevronRight } from 'lucide-react';

const RemindersModal = ({ isOpen, onClose, appointments, labResults, userId }) => {
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'
  
  if (!isOpen) return null;

  // Get all appointments
  const now = new Date();
  const allAppointments = appointments
    .filter(appt => {
      return appt.consultationStatus !== "completed";
    })
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  // Get upcoming appointments (next 30 days)
  const upcomingAppointments = allAppointments
    .filter(appt => {
      const apptDate = new Date(appt.appointmentDate);
      return apptDate >= now;
    });

  // Get recent lab results (last 30 days)
  const recentLabResults = labResults
    .filter(lab => {
      const labDate = new Date(lab.date);
      return (now - labDate) <= (30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate days difference
  const getDaysDifference = (dateString) => {
    const date = new Date(dateString);
    const diffTime = date - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calendar view functions
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week of the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days to display
    const totalDays = daysFromPrevMonth + lastDay.getDate();
    const totalWeeks = Math.ceil(totalDays / 7);
    
    const days = [];
    let dayCounter = 0;
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
      days.push({
        date: new Date(year, month - 1, i),
        isCurrentMonth: false,
        day: i
      });
      dayCounter++;
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        day: i
      });
      dayCounter++;
    }
    
    // Next month days to fill the grid
    const remainingDays = totalWeeks * 7 - dayCounter;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        day: i
      });
    }
    
    return days;
  };

  // Check if a date has appointments
  const getAppointmentsForDate = (date) => {
    return allAppointments.filter(appt => {
      const apptDate = new Date(appt.appointmentDate);
      return apptDate.getDate() === date.getDate() && 
             apptDate.getMonth() === date.getMonth() && 
             apptDate.getFullYear() === date.getFullYear();
    });
  };

  // Weekday labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Format month for display
  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0367A5]">Your Health Reminders</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {/* View Toggle Buttons */}
          <div className="mb-4 flex gap-2">
            <button 
              onClick={() => setView('calendar')} 
              className={`px-4 py-2 rounded-lg ${view === 'calendar' 
                ? 'bg-[#0367A5] text-white' 
                : 'bg-gray-200 text-gray-700'}`}
            >
              Calendar View
            </button>
            <button 
              onClick={() => setView('list')} 
              className={`px-4 py-2 rounded-lg ${view === 'list' 
                ? 'bg-[#0367A5] text-white' 
                : 'bg-gray-200 text-gray-700'}`}
            >
              List View
            </button>
          </div>

          {/* Calendar View */}
          {view === 'calendar' && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#0367A5] flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Appointments Calendar
                </h3>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={prevMonth}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-medium text-lg">{formatMonth(currentMonth)}</span>
                  <button 
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              
              {/* Google Calendar Style Grid */}
              <div className="border rounded-lg overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b">
                  {weekdays.map(day => (
                    <div key={day} className="p-2 text-center font-medium text-gray-700 border-r last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                  {generateCalendarDays().map((day, index) => {
                    const dateAppointments = getAppointmentsForDate(day.date);
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    const hasAppointments = dateAppointments.length > 0;
                    
                    return (
                      <div 
                        key={index}
                        className={`min-h-32 border-r border-b last:border-r-0 relative 
                          ${!day.isCurrentMonth ? 'bg-gray-50' : ''} 
                          ${isToday ? 'bg-blue-50' : ''}`}
                      >
                        {/* Day number */}
                        <div className={`p-1 text-right ${!day.isCurrentMonth ? 'text-gray-400' : ''} 
                          ${isToday ? 'text-blue-600 font-bold' : ''} 
                          ${hasAppointments && day.isCurrentMonth ? 'text-blue-800' : ''}`}>
                          {day.day}
                        </div>
                        
                        {/* Appointments list for this day */}
                        <div className="px-1">
                          {dateAppointments.map((appt, i) => {
                            // Get doctor's first name or full name based on space
                            const doctorName = appt.bookedDoctor?.name || "Doctor";
                            const shortDoctorName = doctorName.includes(' ') ? 
                              doctorName.split(' ')[0] : doctorName;
                              
                            return (
                              <div 
                                key={i}
                                className="mb-1 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 rounded p-1 cursor-pointer overflow-hidden"
                              >
                                <div className="font-medium">
                                  {appt.appointmentTime} - Dr. {shortDoctorName}
                                </div>
                                {appt.appointmentReason && (
                                  <div className="text-xs truncate text-blue-700">
                                    {appt.appointmentReason}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Appointment Detail Panel - shown when an appointment is clicked */}
              {/* (Would be implemented with state for selected appointment) */}
            </div>
          )}

          {/* List View */}
          {view === 'list' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-[#0367A5] flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Appointments ({upcomingAppointments.length})
              </h3>
              
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appt, index) => {
                    const daysToAppt = getDaysDifference(appt.appointmentDate);
                    return (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              Appointment with Dr. {appt.bookedDoctor?.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {formatDate(appt.appointmentDate)} at {appt.appointmentTime}
                            </div>
                            {appt.appointmentReason && (
                              <div className="text-sm mt-1">
                                <span className="font-medium">Reason:</span> {appt.appointmentReason}
                              </div>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            daysToAppt <= 3 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {daysToAppt === 0 ? 'Today' : `In ${daysToAppt} day${daysToAppt !== 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-gray-500 italic">No upcoming appointments in the next 30 days</div>
              )}
            </div>
          )}

          {/* Lab Results Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#0367A5] flex items-center gap-2">
              <Flask className="w-5 h-5" />
              Recent Lab Results ({recentLabResults.length})
            </h3>
            
            {recentLabResults.length > 0 ? (
              <div className="space-y-4">
                {recentLabResults.map((lab, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{lab.testType}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatDate(lab.date)} - Ordered by {lab.referringDoctor}
                        </div>
                        {lab.findings && (
                          <div className="text-sm mt-1">
                            <span className="font-medium">Findings:</span> {lab.findings}
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        lab.reportStatus === "Normal" 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {lab.reportStatus}
                      </span>
                    </div>
                    {lab.parameters?.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-1">Key Parameters:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {lab.parameters.slice(0, 4).map((param, i) => (
                            <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                              <div className="flex justify-between">
                                <span className="font-medium">{param.parameter}</span>
                                <span>{param.result}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Ref: {param.referenceRange} • {param.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {lab.reportStatus !== "Normal" && (
                      <div className="mt-3 text-sm text-red-600 font-medium">
                        ⚠️ Abnormal result - Please consult your doctor
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">No lab results in the last 30 days</div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[#0367A5] text-white rounded hover:bg-[#024e7a]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemindersModal;