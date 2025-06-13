import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Calendar, Clock } from 'lucide-react';

const EditAppointmentTimeBox = ({ appointment, onClose, onSave }) => {
  const [selectedSlot, setSelectedSlot] = useState({
    date: appointment?.appointmentDate || '',
    time: appointment?.appointmentTime || ''
  });
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    if (appointment?.bookedDoctor) {
      generateAvailableDates();
    }
  }, [appointment]);

  useEffect(() => {
    if (selectedSlot.date) {
      generateTimeSlotsForDate(selectedSlot.date);
    }
  }, [selectedSlot.date]);

  const handleDateChange = (e) => {
    setSelectedSlot(prev => ({ ...prev, date: e.target.value, time: '' }));
  };

  const handleTimeChange = (e) => {
    setSelectedSlot(prev => ({ ...prev, time: e.target.value }));
  };

  const parseAvailableTime = () => {
    if (!appointment?.bookedDoctor?.availableTime) return { startHour: 8, endHour: 20 };
    
    const timeString = appointment.bookedDoctor.availableTime.toLowerCase();
    const [startPart, endPart] = timeString.split('-');
    
    const parseTime = (timeStr) => {
      const [hourStr, period] = timeStr.match(/(\d+)(am|pm)?/)?.slice(1) || [];
      let hour = parseInt(hourStr, 10);
      
      if (period === 'pm' && hour !== 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;
      
      return hour;
    };
    
    return {
      startHour: parseTime(startPart),
      endHour: parseTime(endPart)
    };
  };

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Generate dates for the next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Check if the doctor has any availability on this day (you might want to add more logic here)
      dates.push(date.toISOString().split('T')[0]);
    }
    
    setAvailableDates(dates);
  };

  const generateTimeSlotsForDate = (date) => {
    const { startHour, endHour } = parseAvailableTime();
    const slots = [];
    const interval = 25; // 25-minute intervals
    
    // Convert to Date object for comparison
    const selectedDateObj = new Date(date);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    // Get all booked slots for this doctor on the selected date
    const bookedSlots = appointment?.bookedDoctor?.bookedslots
      ?.filter(slot => slot.date === date)
      .map(slot => {
        // Normalize time format (handle both "10:50 AM" and "16:00" formats)
        let time = slot.time;
        if (time.includes('AM') || time.includes('PM')) {
          const [timePart, period] = time.split(' ');
          let [hours, minutes] = timePart.split(':').map(Number);
          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
        return time;
      }) || [];
    
    // Generate all possible slots for the doctor's available hours
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour === endHour - 1 && minute + interval > 60) break;
        
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Only include slots that aren't booked
        if (!bookedSlots.includes(time)) {
          slots.push(time);
        }
      }
    }
    
    setAvailableTimeSlots(slots);
  };

  const updateSlot = async () => {
    try {
      if (!selectedSlot.date || !selectedSlot.time) {
        toast.error("Please select both date and time");
        return;
      }

      await onSave({
        ...appointment,
        appointmentDate: selectedSlot.date,
        appointmentTime: selectedSlot.time
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update appointment time");
    }
  };

  if (!appointment) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Appointment Details</h1>

      <div className="grid grid-cols-2 gap-4">
        {/* Patient Info */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Patient Info</h2>
          <p><strong>Name:</strong> {appointment.bookedPatient?.name || 'N/A'}</p>
          <p><strong>Email:</strong> {appointment.bookedPatient?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {appointment.bookedPatient?.phone || 'N/A'}</p>
        </div>

        {/* Doctor Info */}
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Doctor Info</h2>
          <p><strong>Name:</strong> {appointment.bookedDoctor?.name || 'N/A'}</p>
          <p><strong>Specialist:</strong> {appointment.bookedDoctor?.specialist || 'N/A'}</p>
          <p><strong>Available Time:</strong> {appointment.bookedDoctor?.availableTime || 'N/A'}</p>
        </div>
      </div>

      {/* Appointment Info */}
      <div className="mt-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Appointment Info</h2>
        <p><strong>Type:</strong> {appointment.appointmentType || 'N/A'}</p>
        <p><strong>Reason:</strong> {appointment.appointmentReason || 'N/A'}</p>
        <p><strong>Current Date:</strong> {appointment.appointmentDate || 'N/A'}</p>
        <p><strong>Current Time:</strong> {appointment.appointmentTime || 'N/A'}</p>
      </div>

      {/* Change Slot */}
      <div className="mt-6 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Change Slot</h2>

        <div className="space-y-4">
          {/* Date Picker */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <select
                className="w-full p-3 rounded-lg border border-gray-300 appearance-none pl-10"
                value={selectedSlot.date}
                onChange={handleDateChange}
              >
                <option value="">Select a date</option>
                {availableDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </option>
                ))}
              </select>
              <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Time Picker */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <div className="relative">
              <select
                className="w-full p-3 rounded-lg border border-gray-300 appearance-none pl-10"
                value={selectedSlot.time}
                onChange={handleTimeChange}
                disabled={!selectedSlot.date}
              >
                <option value="">Select a time</option>
                {availableTimeSlots.map(time => {
                  const [hours, minutes] = time.split(':').map(Number);
                  const period = hours >= 12 ? 'PM' : 'AM';
                  const displayHours = hours % 12 || 12;
                  const displayTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                  
                  return (
                    <option key={time} value={displayTime}>
                      {displayTime}
                    </option>
                  );
                })}
              </select>
              <Clock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={updateSlot}
            className="flex-1 bg-teal-500 hover:bg-blue-400 text-white font-semibold py-3 rounded-lg transition"
            disabled={!selectedSlot.date || !selectedSlot.time}
          >
            Update Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentTimeBox;