import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AppointmentTrendsChart = ({ appointments }) => {
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    if (!appointments || appointments.length === 0) return;
    
    // Group appointments by date
    const appointmentsByDate = appointments.reduce((acc, appointment) => {
      const date = new Date(appointment.appointmentDate).toLocaleDateString();
      
      if (!acc[date]) {
        acc[date] = {
          date,
          total: 0,
          confirmed: 0
        };
      }
      
      acc[date].total += 1;
      
      if (appointment.approvedByAdmin === "Accepted") {
        acc[date].confirmed += 1;
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    const sortedData = Object.values(appointmentsByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Get last 7 days
    
    setChartData(sortedData);
  }, [appointments]);
  
  return (
    <div className="bg-white rounded-lg shadow-md h-64 p-4">
      <h3 className="text-lg font-bold text-[#0665A7] mb-2">Appointment Trends (Last 7 Days)</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Appointments" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="confirmed" stroke="#4FA4A2" name="Confirmed Appointments" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No appointment data available
        </div>
      )}
    </div>
  );
};

export default AppointmentTrendsChart;