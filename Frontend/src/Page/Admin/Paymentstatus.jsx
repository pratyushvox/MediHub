import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaClock, FaCheckCircle, FaSearch, FaFilter, FaEdit, FaExchangeAlt } from 'react-icons/fa';
import { baseUrl } from '../../Constant/Constant';
import Box from '../../Component/Box';
import Sidebar from '../../Component/Sidebar';

const PaymentStatusPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filteredLabReports, setFilteredLabReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [viewMode, setViewMode] = useState('appointment'); // 'appointment' or 'labreport'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch appointments
        const appointmentsResponse = await fetch(`${baseUrl}appointments/getAppointment`);

        if (!appointmentsResponse.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const appointmentsData = await appointmentsResponse.json();
        const approvedAppointments = appointmentsData.filter(
          app => app.approvedByAdmin === "Accepted"
        );
        setAppointments(approvedAppointments);
        setFilteredAppointments(approvedAppointments);
        // Fetch lab reports
        const labReportsResponse = await fetch(`${baseUrl}labreport/getTestRequest`);
        if (!labReportsResponse.ok) {
          throw new Error('Failed to fetch lab reports');
        }
        const labReportsData = await labReportsResponse.json();
        // Extract data array from the response
        setLabReports(labReportsData.data || []);
        setFilteredLabReports(labReportsData.data || []);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Filter appointments
    let appointmentResults = appointments.filter(
      app => app.approvedByAdmin === "Accepted"
    );
    if (statusFilter !== 'All') {
      appointmentResults = appointmentResults.filter(app => app.payment.status === statusFilter);
    }
    if (dateFilter) {
      appointmentResults = appointmentResults.filter(app => app.appointmentDate === dateFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      appointmentResults = appointmentResults.filter(app => 
        app.bookedPatient.name.toLowerCase().includes(term) ||
        app.bookedPatient.email.toLowerCase().includes(term) ||
        app.bookedPatient.phone.includes(term) ||
        app.bookedDoctor.name.toLowerCase().includes(term)
      );
    }
    setFilteredAppointments(appointmentResults);
    
    // Filter lab reports
    let labResults = labReports;
    if (statusFilter !== 'All') {
      labResults = labResults.filter(lab => lab.TestResult === statusFilter);
    }
    if (dateFilter) {
      // Format date to match API format
      labResults = labResults.filter(lab => {
        const labDate = new Date(lab.createdAt).toISOString().split('T')[0];
        return labDate === dateFilter;
      });
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      labResults = labResults.filter(lab => 
        (lab.patientName && lab.patientName.toLowerCase().includes(term)) ||
        (lab.contactNumber && lab.contactNumber.includes(term)) ||
        (lab.testType && lab.testType.toLowerCase().includes(term)) ||
        (lab.bodyPart && lab.bodyPart.toLowerCase().includes(term)) ||
        (lab.referringDoctor && lab.referringDoctor.toLowerCase().includes(term))
      );
    }
    setFilteredLabReports(labResults);
  }, [searchTerm, statusFilter, dateFilter, appointments, labReports]);

  const handleRowClick = (appointment) => {
    setSelectedAppointment(appointment);
    setPaymentStatus(appointment.payment.status);
    setShowPaymentModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`${baseUrl}Payment/${selectedAppointment._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: paymentStatus }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }
  
      const updatedData = await response.json();
  
      // Update the local state with the new data
      const updatedAppointments = appointments.map(app => {
        if (app._id === selectedAppointment._id) {
          return {
            ...app,
            payment: {
              ...app.payment,
              status: paymentStatus
            }
          };
        }
        return app;
      });
  
      setAppointments(updatedAppointments);
      setFilteredAppointments(updatedAppointments);
      setShowPaymentModal(false);
      
      // Optional: Show success message
      alert('Payment status updated successfully');
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Calculate statistics for appointments
  const totalPendingAppointments = appointments.filter(app => app.payment.status === 'Pending').length;
  const totalCompletedAppointments = appointments.filter(app => app.payment.status === 'Completed').length;
  const appointmentIncome = appointments
    .filter(app => app.payment.status === 'Completed')
    .reduce((sum, app) => sum + app.payment.amount, 0);

  // Calculate statistics for lab reports
  const totalPendingLabReports = labReports.filter(lab => lab.TestResult === 'Pending').length;
  const totalCompletedLabReports = labReports.filter(lab => lab.TestResult === 'Done').length;
  const labReportIncome = labReports.reduce((sum, lab) => sum + (parseFloat(lab.price) || 0), 0);

  // Combined statistics
  const totalPending = viewMode === 'appointment' ? totalPendingAppointments : totalPendingLabReports;
  const totalCompleted = viewMode === 'appointment' ? totalCompletedAppointments : totalCompletedLabReports;
  const totalIncome = appointmentIncome + labReportIncome;

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" className={sidebarOpen ? 'block' : 'hidden'} />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-200"
            >
              {sidebarOpen ? 'Hide' : 'Show'} Sidebar
            </button>
            <h1 className="text-2xl font-bold">Payment Status Dashboard</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Box 
              icon={<FaClock />}
              count={totalPending}
              label={viewMode === 'appointment' ? "Pending Payments" : "Pending Lab Tests"}
              className="bg-yellow-100 text-yellow-800"
              onClick={() => setStatusFilter('Pending')}
            />
            <Box 
              icon={<FaCheckCircle />}
              count={totalCompleted}
              label={viewMode === 'appointment' ? "Completed Payments" : "Completed Lab Tests"}
              className="bg-green-100 text-green-800"
              onClick={() => setStatusFilter(viewMode === 'appointment' ? 'Completed' : 'Done')}
            />
            <Box 
              icon={<FaMoneyBillWave />}
              count={`Rs. ${totalIncome.toFixed(2)}`}
              label="Total Income"
              className="bg-blue-100 text-blue-800"
              onClick={() => setStatusFilter('All')}
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder={viewMode === 'appointment' ? "Search by patient or doctor name, email, or phone" : "Search by patient name, contact number or test type"}
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => setViewMode(viewMode === 'appointment' ? 'labreport' : 'appointment')}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <FaExchangeAlt className="mr-2" />
                  {viewMode === 'appointment' ? 'View Lab Reports' : 'View Appointments'}
                </button>
                
                <div className="flex items-center">
                  <FaFilter className="mr-2 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    {viewMode === 'appointment' ? (
                      <>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </>
                    ) : (
                      <>
                        <option value="Done">Done</option>
                        <option value="Misunderstood">Misunderstood</option>
                      </>
                    )}
                  </select>
                </div>
                
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => {
                    setStatusFilter('All');
                    setDateFilter('');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              {viewMode === 'appointment' ? (
                // Appointments Table
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
                        <tr 
                          key={appointment._id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleRowClick(appointment)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{appointment.bookedPatient.name}</div>
                                <div className="text-sm text-gray-500">{appointment.bookedPatient.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.bookedDoctor.name}</div>
                            <div className="text-sm text-gray-500">{appointment.bookedDoctor.specialist}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(appointment.appointmentDate).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Rs. {appointment.payment.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.payment.method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${appointment.payment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                appointment.payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                appointment.payment.status === 'Failed' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {appointment.payment.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No appointments found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                // Lab Reports Table
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Information</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLabReports.length > 0 ? (
                      filteredLabReports.map((report) => (
                        <tr key={report._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{report.patientName}</div>
                                <div className="text-sm text-gray-500">{report.contactNumber}</div>
                                <div className="text-sm text-gray-500">{report.patientId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.testType}</div>
                            <div className="text-sm text-gray-500">{report.bodyPart}</div>
                            <div className="text-sm text-gray-500">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${report.urgency === 'Urgent' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                {report.urgency}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{report.referringDoctor}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(report.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Rs. {report.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {report.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${report.TestResult === 'Done' ? 'bg-green-100 text-green-800' : 
                                report.TestResult === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {report.TestResult}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          No lab reports found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {showPaymentModal && selectedAppointment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-5">
              <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">Payment Details</h2>
                    <button 
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-7">
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-lg mb-2">Patient Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">FULL NAME</p>
                          <p>{selectedAppointment.bookedPatient.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">DATE OF BIRTH</p>
                          <p>{selectedAppointment.bookedPatient.personalinfo.dobAD}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">PHONE</p>
                          <p>{selectedAppointment.bookedPatient.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">EMAIL</p>
                          <p>{selectedAppointment.bookedPatient.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-lg mb-2">Payment Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">APPOINTMENT DATE</p>
                          <p>{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">APPOINTMENT TIME</p>
                          <p>{selectedAppointment.appointmentTime}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">AMOUNT</p>
                          <p>Rs. {selectedAppointment.payment.amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">METHOD</p>
                          <p>{selectedAppointment.payment.method}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        PAYMENT STATUS
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateStatus}
                        className="px-4 py-2 bg-[#5facaa] text-white rounded-lg hover:bg-[#4E9694] flex items-center"
                      >
                        <FaEdit className="mr-2" />
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;