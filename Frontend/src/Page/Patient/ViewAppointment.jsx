import React, { useState, useEffect } from "react";
import ReusableTable from "../../Component/Table"; // Adjust the path based on your project structure
import Sidebar from "../../Component/Sidebar"; // Import your Sidebar component
import PatientNavbar from "../../Component/PatientNavbar"; // Import PatientNavbar component
import { Search, Calendar, Filter, ChevronDown, Eye } from "lucide-react";
import axios from "axios"; // Make sure axios is imported
import { baseUrl } from "../../Constant/Constant"; // Import baseUrl from constants folder

const ViewAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define columns for the table
  const columns = [
    { 
      header: "PATIENT",
      accessor: "patient", 
      // Custom rendering for patient cell
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
      // Custom rendering for doctor cell
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
      // Custom rendering for department cell
      render: (department) => (
        <span className="text-blue-600">{department}</span>
      )
    },
    { 
      header: "DATE",
      accessor: "date",
      // Custom rendering for date cell
      render: (dateText) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
          <span>{dateText}</span>
        </div>
      )
    },
    { 
      header: "STATUS",
      accessor: "status",
      // Custom rendering for status cell
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
    }
  ];

  useEffect(() => {
    // Get userId from local storage
    const userId = localStorage.getItem("Userid");
    
    if (!userId) {
      setError("User ID not found in local storage");
      setLoading(false);
      return;
    }
    
    // Fetch appointments
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${baseUrl}appointments/getAppointment`);
        
        // Filter appointments based on userId
        const userAppointments = response.data.filter(
          appointment => appointment.bookedPatient._id === userId
        );
        
        // Transform data to match table format
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
          department: appointment.bookedDoctor.specialist.replace('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase()), // Format specialist field as department
          date: `${appointment.appointmentTime} · ${formatDate(appointment.appointmentDate)}`,
          status: appointment.approvedByAdmin
        }));
        
        setAppointments(formattedAppointments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to fetch appointments");
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    // Add ordinal suffix to day
    const suffix = ['th', 'st', 'nd', 'rd'][day % 10 > 3 ? 0 : (day % 100 - day % 10 !== 10 ? day % 10 : 0)];
    
    return `${day}${suffix} ${month}, ${year}`;
  };

  // Custom table actions
  const customActions = (row) => (
    <div className="flex items-center gap-2">
      <button className="p-1 text-gray-500 hover:text-gray-700">
        <Eye size={18} />
      </button>
      <button className="p-1 text-gray-500 hover:text-gray-700" onClick={() => handleEdit(row)}>
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h6v6"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15L20 4"></path>
        </svg>
      </button>
      <button className="p-1 text-gray-500 hover:text-gray-700" onClick={() => handleDelete(row)}>
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>
  );

  const handleEdit = (row) => {
    console.log("Edit", row);
  };

  const handleDelete = (row) => {
    console.log("Delete", row);
  };

  // Extend ReusableTable with custom render support
  const EnhancedTable = ({ columns, data, ...rest }) => {
    // Transform columns to support custom rendering
    const processedColumns = columns.map(col => {
      if (col.render) {
        return {
          header: col.header,
          accessor: col.accessor,
          renderCell: true
        };
      }
      return col;
    });

    // Transform data to include rendered cells
    const processedData = data.map(row => {
      const newRow = { ...row };
      columns.forEach(col => {
        if (col.render) {
          newRow[col.accessor] = col.render(row[col.accessor]);
        }
      });
      return newRow;
    });

    return <ReusableTable columns={processedColumns} data={processedData} {...rest} />;
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
        <div className="pt-16 p-8"> {/* Add padding-top to account for the fixed navbar */}
          {/* Header with search and buttons */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search appointments..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg">
                <Calendar size={20} />
                <span>Book Appointment</span>
              </button>
              <button className="flex items-center gap-2 bg-teal-600 text-white py-2 px-4 rounded-lg">
                <Filter size={20} />
                <span>Filter</span>
              </button>
              <div className="relative">
                <button className="flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg">
                  <span>Actions</span>
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>
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
          ) : appointments.length === 0 ? (
            <div className="bg-gray-100 p-8 text-center rounded-lg">
              <h3 className="text-xl font-medium text-gray-700">No appointments found</h3>
              <p className="text-gray-500 mt-2">You haven't booked any appointments yet.</p>
            </div>
          ) : (
            <EnhancedTable
              columns={columns}
              data={appointments}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions={true}
              striped={false}
              hoverable={true}
              bordered={true}
              renderActions={customActions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAppointment;