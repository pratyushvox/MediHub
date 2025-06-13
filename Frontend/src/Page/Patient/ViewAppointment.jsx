import React, { useState, useEffect } from "react";
import ReusableTable from "../../Component/Table";
import Sidebar from "../../Component/Sidebar";
import PatientNavbar from "../../Component/PatientNavbar";
import { Search, Calendar, Filter, ChevronDown, Eye, ClipboardList, Stethoscope } from "lucide-react";
import { CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { baseUrl } from "../../Constant/Constant";

const ViewAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Define columns for the table
  const columns = [
    { 
      header: "PATIENT",
      accessor: "patient", 
      renderCell: true,
      render: (patient) => (
        <div className="flex items-center gap-3">
          <div className={`bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center`}>
            {patient.name.split(' ').map(name => name[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-blue-600">{patient.name}</div>
            <div className="text-sm text-gray-500">{patient.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: "DOCTOR",
      accessor: "doctor",
      render: (doctor) => (
        <div className="flex items-center gap-3">
          <div className={`bg-red-400 text-white w-10 h-10 rounded-full flex items-center justify-center`}>
            {doctor.name.split(' ').map(name => name[0]).join('')}
          </div>
          <div>
            <div className="font-medium">{doctor.name}</div>
            <div className="text-sm text-gray-500">{doctor.email}</div>
          </div>
        </div>
      )
    },
    { 
      header: "DEPARTMENT",
      accessor: "department",
      render: (department) => (
        <span className="text-blue-600">{department}</span>
      )
    },
    { 
      header: "DATE",
      accessor: "date",
      render: (dateText) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          <span>{dateText}</span>
        </div>
      )
    },
    { 
      header: "APPOINTMENT STATUS",
      accessor: "status",
      render: (status) => {
        if (status === "Accepted") {
          return (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-green-500">Confirmed</span>
            </div>
          );
        } else if (status === "Rejected") {
          return (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span className="text-red-500">Canceled</span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-yellow-500">Pending</span>
            </div>
          );
        }
      }
    },
    { 
      header: "CONSULTATION STATUS",
      accessor: "consultationStatus",
      render: (status) => {
        if (status === "completed") {
          return (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Completed</span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">Pending</span>
            </div>
          );
        }
      }
    }
  ];

  useEffect(() => {
    const userId = localStorage.getItem("Userid");
    
    if (!userId) {
      setError("User ID not found in local storage");
      setLoading(false);
      return;
    }
    
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${baseUrl}appointments/getAppointment`);
        const userAppointments = response.data.filter(
          appointment => appointment.bookedPatient && appointment.bookedPatient._id === userId
        );
        
        const formattedAppointments = userAppointments.map(appointment => ({
          id: appointment._id,
          patient: {
            name: appointment.bookedPatient.name,
            email: appointment.bookedPatient.email
          },
          doctor: {
            name: appointment.bookedDoctor.name,
            email: appointment.bookedDoctor.email
          },
          department: appointment.bookedDoctor.specialist.replace('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
          date: `${appointment.appointmentTime} · ${formatDate(appointment.appointmentDate)}`,
          status: appointment.approvedByAdmin,
          consultationStatus: appointment.consultationStatus || 'pending',
          consultationNotes: appointment.consultationNotes,
          rawData: appointment,
          appointmentDate: new Date(appointment.appointmentDate)
        }));
        
        setAppointments(formattedAppointments);
        setFilteredAppointments(formattedAppointments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to fetch appointments");
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [searchTerm, activeTab, statusFilter, appointments]);

  const filterAppointments = () => {
    let filtered = [...appointments];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.patient.name.toLowerCase().includes(term) ||
        appointment.doctor.name.toLowerCase().includes(term) ||
        appointment.department.toLowerCase().includes(term)
      );
    }
    
    // Filter by tab (upcoming/past)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (activeTab === "upcoming") {
      filtered = filtered.filter(appointment => appointment.appointmentDate >= today);
    } else {
      filtered = filtered.filter(appointment => appointment.appointmentDate < today);
    }
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }
    
    setFilteredAppointments(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : (day % 100 - day % 10 !== 10 ? day % 10 : 0)];
    return `${day}${suffix} ${month}, ${year}`;
  };

  const handleRowClick = (row) => {
    setSelectedAppointment(row.rawData);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedAppointment(null);
  };

  const customActions = (row) => (
    <div className="flex items-center gap-2">
      <button 
        className="p-1 text-gray-500 hover:text-gray-700"
        onClick={() => handleRowClick(row)}
      >
        <Eye size={18} />
      </button>
    </div>
  );

  const toggleStatusDropdown = () => {
    setShowStatusDropdown(!showStatusDropdown);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setShowStatusDropdown(false);
  };

  const renderConsultationNotes = () => {
    if (selectedAppointment.approvedByAdmin === "Rejected") {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Your appointment was cancelled. Please book another appointment if you need consultation.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (selectedAppointment.consultationStatus === "completed") {
      return (
        <div className="bg-white p-4 rounded border border-gray-200">
          {selectedAppointment.consultationNotes ? (
            <>
              <p className="text-gray-700 font-medium mb-2">Consultation Summary:</p>
              <p className="text-gray-700">{selectedAppointment.consultationNotes}</p>
              {selectedAppointment.rawData?.hemoglobin && (
                <div className="mt-4">
                  <p className="text-gray-700 font-medium mb-2">Test Results:</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">Hemoglobin</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{selectedAppointment.rawData.hemoglobin}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">12.0-15.0</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                            {parseFloat(selectedAppointment.rawData.hemoglobin) > 15.0 ? (
                              <span className="text-red-600">High</span>
                            ) : parseFloat(selectedAppointment.rawData.hemoglobin) < 12.0 ? (
                              <span className="text-yellow-600">Low</span>
                            ) : (
                              <span className="text-green-600">Normal</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 italic">No consultation notes provided by the doctor.</p>
          )}
        </div>
      );
    }

    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {selectedAppointment.approvedByAdmin === "Pending"
                ? "Your appointment is pending approval. Please wait for confirmation."
                : `Your consultation is still pending. Please visit the doctor at your scheduled appointment time (${selectedAppointment.appointmentTime} on ${formatDate(selectedAppointment.appointmentDate)}) to get your consultation notes and recommendations.`}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 z-40">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full bg-gray-100 min-h-screen ml-64 mt-10">
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-64 right-0 z-30">
          <PatientNavbar pageTitle="View Appointments" />
        </div>

        {/* Scrollable Content */}
        <div className="pt-16 p-8">
          {/* Header with search and buttons */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search appointments..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg">
                <Calendar size={20} />
                <span>Book Appointment</span>
              </button>
              
              {/* Status Filter Dropdown */}
              <div className="relative">
                <button 
                  className="flex items-center gap-2 bg-teal-600 text-white py-2 px-4 rounded-lg"
                  onClick={toggleStatusDropdown}
                >
                  <Filter size={20} />
                  <span>Filter</span>
                  <ChevronDown size={20} />
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">Status</div>
                      <button 
                        className={`block px-4 py-2 text-sm w-full text-left ${statusFilter === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => handleStatusFilterChange('all')}
                      >
                        All Statuses
                      </button>
                      <button 
                        className={`block px-4 py-2 text-sm w-full text-left ${statusFilter === 'Pending' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => handleStatusFilterChange('Pending')}
                      >
                        Pending
                      </button>
                      <button 
                        className={`block px-4 py-2 text-sm w-full text-left ${statusFilter === 'Accepted' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => handleStatusFilterChange('Accepted')}
                      >
                        Confirmed
                      </button>
                      <button 
                        className={`block px-4 py-2 text-sm w-full text-left ${statusFilter === 'Rejected' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => handleStatusFilterChange('Rejected')}
                      >
                        Canceled
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming Appointments
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${activeTab === 'past' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('past')}
            >
              Past Appointments
            </button>
          </div>

          {/* Loading, Error, or Table */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-gray-100 p-8 text-center rounded-lg">
              <h3 className="text-xl font-medium text-gray-700">No appointments found</h3>
              <p className="text-gray-500 mt-2">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming appointments." 
                  : "You don't have any past appointments."}
              </p>
            </div>
          ) : (
            <>
              <ReusableTable
                columns={columns}
                data={filteredAppointments.map(appointment => ({
                  ...appointment,
                  patient: columns[0].render(appointment.patient),
                  doctor: columns[1].render(appointment.doctor),
                  department: columns[2].render(appointment.department),
                  date: columns[3].render(appointment.date),
                  status: columns[4].render(appointment.status),
                  consultationStatus: columns[5].render(appointment.consultationStatus),
                }))}
                showActions={true}
                striped={false}
                hoverable={true}
                bordered={true}
                onClick={handleRowClick}
                renderActions={customActions}
              />
              
              {/* Consultation Notes Dialog */}
              {isDialogOpen && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                          Consultation Details
                        </h2>
                        <button 
                          onClick={closeDialog}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Patient and Doctor Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-purple-100 p-2 rounded-full">
                                <ClipboardList className="text-purple-600 w-5 h-5" />
                              </div>
                              <h3 className="font-medium">Patient Information</h3>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Name:</span> {selectedAppointment.bookedPatient.name}</p>
                              <p><span className="font-medium">Age:</span> {selectedAppointment.bookedPatient.personalinfo?.age || 'N/A'}</p>
                              <p><span className="font-medium">Gender:</span> {selectedAppointment.bookedPatient.personalinfo?.gender || 'N/A'}</p>
                              <p><span className="font-medium">Blood Group:</span> {selectedAppointment.bookedPatient.personalinfo?.bloodGroup || 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-blue-100 p-2 rounded-full">
                                <Stethoscope className="text-blue-600 w-5 h-5" />
                              </div>
                              <h3 className="font-medium">Doctor Information</h3>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">Name:</span> Dr. {selectedAppointment.bookedDoctor.name}</p>
                              <p><span className="font-medium">Specialization:</span> {selectedAppointment.bookedDoctor.specialist.replace('_', ' ')}</p>
                              <p><span className="font-medium">Experience:</span> {selectedAppointment.bookedDoctor.experience} years</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Appointment Details */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Appointment Details</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p><span className="font-medium">Date:</span> {formatDate(selectedAppointment.appointmentDate)}</p>
                              <p><span className="font-medium">Time:</span> {selectedAppointment.appointmentTime}</p>
                            </div>
                            <div>
                              <p><span className="font-medium">Type:</span> {selectedAppointment.appointmentType}</p>
                              <p><span className="font-medium">Reason:</span> {selectedAppointment.appointmentReason}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Consultation Notes */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium mb-2">Doctor's Notes</h3>
                          {renderConsultationNotes()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAppointment;