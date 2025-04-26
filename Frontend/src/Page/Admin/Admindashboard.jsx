import React, { useState, useEffect, useCallback } from "react"; 
import { FaUsers, FaUserMd, FaProcedures, FaMoneyBillWave } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom"; 
import Sidebar from "../../Component/Sidebar"; 
import Box from "../../Component/Box"; 
import AppointmentTrendsChart from "../../Component/Appointmenttrendchart";
import RevenueAnalysisChart from "../../Component/RevenueAnalysisChart";
import { baseUrl } from "../../Constant/Constant"; 
import { toast } from "react-toastify";
import axios from 'axios'
import AdminNavbar from "../../Component/Adminnavbar";
import { NotificationProvider } from "../../Context/Notificationcontext";




const AdminDashboard = () => {   
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalIncome: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ 
    show: false, 
    action: null, 
    id: null,
    message: ""
  });
  const [processingId, setProcessingId] = useState(null);
  const [labReports, setLabReports] = useState([]);
  const adminId = localStorage.getItem('adminId');
  console.log('adminniddd', adminId)


  const isUpcomingOrToday = (dateString) => {
    if (!dateString) return false;
    const appointmentDate = new Date(dateString);
    if (isNaN(appointmentDate.getTime())) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only
    
    return appointmentDate >= today;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}Displaydata`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        console.log("Dashboard data loaded successfully");
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
      toast.error(`Failed to load dashboard: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabReports = async () => {
    try {
      const response = await fetch(`${baseUrl}labreport/getTestRequest`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const result = await response.json();
      
      if (result.success) {
        setLabReports(result.data);
      } else {
        throw new Error("Failed to fetch lab reports");
      }
    } catch (err) {
      console.error("Error fetching lab reports:", err);
      setError(err.message);
      toast.error(`Failed to load lab reports: ${err.message}`);
    }
  };

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}appointments/getAppointment`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const result = await response.json();
      
      setAllAppointments(result);
      
      const confirmed = result.filter(app => app.approvedByAdmin === "Accepted" && 
        isUpcomingOrToday(app.appointmentDate)
      );

      setConfirmedAppointments(confirmed);
      
      // Calculate income from appointments
      const appointmentIncome = result.reduce((sum, app) => {
        if (app.payment && app.payment.status === "Completed") {
          return sum + (parseFloat(app.price) || 0);
        }
        return sum;
      }, 0);
      
      // Calculate income from lab reports
      const labReportIncome = labReports.reduce((sum, report) => {
        return sum + (parseFloat(report.price) || 0);
      }, 0);
      
      // Set total income as sum of appointments and lab reports
      setDashboardData(prev => ({
        ...prev,
        totalIncome: (appointmentIncome + labReportIncome) || 0,
        totalAppointments: confirmed.length
      }));
      
      const filteredRequests = result.filter(app => 
        app && app.approvedByAdmin === ""
      );
      setAppointmentRequests(filteredRequests);
      
   } catch (err) {
    console.error("Error fetching appointments:", err);
    setError(err.message);
    toast.error(`Failed to load appointments: ${err.message}`);
  }
}, [labReports]);

  useEffect(() => {
    fetchDashboardData();
    fetchLabReports();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, labReports]);
  const handleApproval = async (appointmentId) => {
    try {
      setProcessingId(appointmentId);
      setConfirmDialog({ show: false, action: null, id: null });
  
      // 1) Approve on the server - backend will handle notifications
      const response = await fetch(`${baseUrl}payment/offline/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to approve appointment");
      }
  
      // 2) Update local state & UI
      setAppointmentRequests(prev => prev.filter(app => app._id !== appointmentId));
      await fetchAppointments();
      toast.success("Appointment approved successfully");
  
    } catch (err) {
      console.error("Error approving appointment:", err);
      setError(err.message);
      toast.error(`Approval failed: ${err.message}`);
      fetchAppointments();
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleRejection = async (appointmentId) => {
    try {
      setProcessingId(appointmentId);
      setConfirmDialog({ show: false, action: null, id: null });
  
      // Send rejection request - backend will handle notifications
      const response = await fetch(`${baseUrl}payment/offline/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId }),
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Failed to reject appointment");
      }
  
      // Optimistic update
      setAppointmentRequests(prev => prev.filter(app => app._id !== appointmentId));
      
      await fetchAppointments();
      toast.success("Appointment rejected successfully");
      
    } catch (err) {
      console.error("Error rejecting appointment:", err);
      setError(err.message);
      toast.error(`Rejection failed: ${err.message}`);
      fetchAppointments();
    } finally {
      setProcessingId(null);
    }
  };
  const showConfirmationDialog = (action, id) => {
    const message = action === "approve" 
      ? "Are you sure you want to approve this appointment?" 
      : "Are you sure you want to reject this appointment?";
    
    setConfirmDialog({
      show: true,
      action,
      id,
      message
    });
  };

  const handleConfirm = () => {
    if (confirmDialog.action === "approve") {
      handleApproval(confirmDialog.id);
    } else if (confirmDialog.action === "reject") {
      handleRejection(confirmDialog.id);
    }
  };

  const handleLogout = () => {     
    localStorage.removeItem("authToken");     
    navigate("/Admin/login");   
    toast.info("Logged out successfully");  
  };    

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleDateString();
  };

  return (     
    <div className="flex h-screen bg-gray-100">       
      <Sidebar role="admin" className="w-64" />    
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Add AdminNavbar at the top */}
        <NotificationProvider overrideRole="admin" overrideId={adminId}>
        <AdminNavbar pageTitle="Admin Dashboard" />
        </NotificationProvider>
            
      
      <div className="flex-1 p-8 overflow-hidden">         
        <h1 className="text-3xl font-extrabold text-[#3CB5AC] mb-6">           
          Admin Dashboard         
        </h1>

        {loading ? (
          <div className="text-center p-4">Loading dashboard data...</div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">Error: {error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">           
            <Box 
              icon={<FaUsers />} 
              count={dashboardData.totalPatients} 
              label="Total Patients" 
              className="bg-[#4FA4A2] text-white"
            />           
            <Box 
              icon={<FaUserMd />} 
              count={dashboardData.totalAppointments} 
              label="Total Appointments" 
              className="bg-[#5BA4D3] text-white"
            />           
            <Box 
              icon={<FaProcedures />} 
              count={dashboardData.totalDoctors} 
              label="Total Doctors" 
              className="bg-[#7FC3D1] text-white"
            />           
            <Box 
              icon={<FaMoneyBillWave />} 
              count={`Rs. ${dashboardData.totalIncome}`} 
              label="Total Income" 
              className="bg-[#54AFA2] text-white"
            />         
          </div>
        )}
                  
        {/* Placeholder for Charts */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <AppointmentTrendsChart appointments={allAppointments} />
          <RevenueAnalysisChart 
            appointments={allAppointments} 
            labReports={labReports} 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Appointment Request Table */}
          <div className="bg-white rounded-lg shadow-md flex flex-col h-[400px]">
            <div className="p-4 border-b font-bold text-[#0665A7] sticky top-0 bg-white z-10">
              Appointment Request
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-100 z-10">
                  <tr>
                    <th className="p-2 text-left">Patient</th>
                    <th className="p-2 text-left">Doctor</th>
                    <th className="p-2 text-left">Date/Time</th>
                    <th className="p-2 text-left">Payment</th>
                    <th className="p-2 text-left">Amount</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentRequests.length > 0 ? (
                    appointmentRequests.map((appointment) => (
                      <tr key={appointment._id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div className="font-medium">{appointment.bookedPatient?.name || "Unknown"}</div>
                          <div className="text-sm text-gray-500">{appointment.bookedPatient?.phone || "N/A"}</div>
                        </td>
                        <td className="p-2">
                          <div className="font-medium">{appointment.bookedDoctor?.name || "Unknown"}</div>
                          <div className="text-sm text-gray-500">{appointment.bookedDoctor?.specialist || "N/A"}</div>
                        </td>
                        <td className="p-2">
                          <div>{formatDate(appointment.appointmentDate)}</div>
                          <div className="text-sm text-gray-500">{appointment.appointmentTime || "N/A"}</div>
                        </td>
                        <td className="p-2">{appointment.paymentMethod || "N/A"}</td>
                        <td className="p-2">Rs. {appointment.price || "0"}</td>
                        <td className="p-2">
                          <button 
                            className="text-green-500 px-2 hover:text-green-700 disabled:opacity-50"
                            onClick={() => showConfirmationDialog("approve", appointment._id)}
                            title="Approve"
                            disabled={processingId === appointment._id}
                          >
                            {processingId === appointment._id ? '...' : '✓'}
                          </button>
                          <button 
                            className="text-red-500 px-2 hover:text-red-700 disabled:opacity-50"
                            onClick={() => showConfirmationDialog("reject", appointment._id)}
                            title="Reject"
                            disabled={processingId === appointment._id}
                          >
                            {processingId === appointment._id ? '...' : '×'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-2 text-center text-gray-500">
                        No pending appointments.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confirmed Appointments Table */}
          <div className="bg-white rounded-lg shadow-md flex flex-col h-[400px]">
          <div className="p-4 border-b font-bold text-[#0665A7] sticky top-0 bg-white z-10">
            Upcoming Confirmed Appointments
          </div>
          <div className="overflow-y-auto flex-1">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100 z-10">
                <tr>
                  <th className="p-2 text-left">Patient</th>
                  <th className="p-2 text-left">Doctor</th>
                  <th className="p-2 text-left">Date/Time</th>
                  <th className="p-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {confirmedAppointments.length > 0 ? (
                  confirmedAppointments.map((appointment) => (
                    <tr key={appointment._id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div className="font-medium">{appointment.bookedPatient?.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{appointment.bookedPatient?.phone || "N/A"}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{appointment.bookedDoctor?.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{appointment.bookedDoctor?.specialist || "N/A"}</div>
                      </td>
                      <td className="p-2">
                        <div>{formatDate(appointment.appointmentDate)}</div>
                        <div className="text-sm text-gray-500">{appointment.appointmentTime || "N/A"}</div>
                      </td>
                      <td className="p-2">Rs. {appointment.price || "0"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-2 text-center text-gray-500">
                      No upcoming confirmed appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>

        {/* Confirmation Dialog */}
        {confirmDialog.show && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Confirm Action</h3>
              <p className="mb-4">{confirmDialog.message}</p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setConfirmDialog({ show: false, action: null, id: null })}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-md text-white ${
                    confirmDialog.action === "approve" 
                      ? "bg-green-500 hover:bg-green-600" 
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                  disabled={processingId === confirmDialog.id}
                >
                  {processingId === confirmDialog.id ? 'Processing...' : 
                   confirmDialog.action === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}

        <button           
          onClick={handleLogout}           
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"         
        >           
          Logout         
        </button>       
      </div> 
      </div>    
    </div>   
  ); 
};   

export default AdminDashboard;