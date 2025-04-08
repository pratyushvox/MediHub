import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RevenueAnalysisChart = ({ appointments, labReports }) => {
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    if ((!appointments || appointments.length === 0) && (!labReports || labReports.length === 0)) return;
    
    // Group by date
    const incomeByDate = {};
    
    // Process appointments
    appointments.forEach(appointment => {
      if (appointment.payment && appointment.payment.status === "Completed") {
        const date = new Date(appointment.appointmentDate).toLocaleDateString();
        if (!incomeByDate[date]) {
          incomeByDate[date] = { date, appointments: 0, labTests: 0, total: 0 };
        }
        const price = parseFloat(appointment.price) || 0;
        incomeByDate[date].appointments += price;
        incomeByDate[date].total += price;
      }
    });
    
    // Process lab reports
    labReports.forEach(report => {
      const date = new Date(report.createdAt || report.date).toLocaleDateString();
      if (!incomeByDate[date]) {
        incomeByDate[date] = { date, appointments: 0, labTests: 0, total: 0 };
      }
      const price = parseFloat(report.price) || 0;
      incomeByDate[date].labTests += price;
      incomeByDate[date].total += price;
    });
    
    // Convert to array and sort by date
    const sortedData = Object.values(incomeByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Get last 7 days
    
    setChartData(sortedData);
  }, [appointments, labReports]);
  
  return (
    <div className="bg-white rounded-lg shadow-md h-64 p-4">
      <h3 className="text-lg font-bold text-[#0665A7] mb-2">Revenue Analysis (Last 7 Days)</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `Rs. ${value}`} />
            <Legend />
            <Bar dataKey="appointments" fill="#5BA4D3" name="Appointment Revenue" />
            <Bar dataKey="labTests" fill="#7FC3D1" name="Lab Test Revenue" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          No revenue data available
        </div>
      )}
    </div>
  );
};

export default RevenueAnalysisChart;