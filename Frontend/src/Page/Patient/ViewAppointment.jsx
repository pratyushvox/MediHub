import React from "react";
import ReusableTable from "../../Component/Table"; // Adjust the path based on your project structure
import Sidebar from "../../Component/Sidebar"; // Import your Sidebar component
import PatientNavbar from "../../Component/PatientNavbar"; // Import PatientNavbar component
import { Search, Calendar, Filter, ChevronDown, Eye } from "lucide-react";

const ViewAppointment = () => {
  // Define columns for the table
  const columns = [
    { 
      header: "PATIENT",
      accessor: "patient", 
      // Custom rendering for patient cell
      render: (patient) => (
        <div className="flex items-center gap-3">
          <div className={`${patient.color} text-white w-10 h-10 rounded-full flex items-center justify-center`}>
            {patient.initials}
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
          <div className={`${doctor.color} text-white w-10 h-10 rounded-full flex items-center justify-center`}>
            {doctor.initials}
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
        if (status === "Confirmed") {
          return (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="text-green-500">Confirmed</span>
            </div>
          );
        } else {
          return (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span className="text-red-500">Canceled</span>
            </div>
          );
        }
      }
    }
  ];

  // Prepare data in the format needed for the table
  const tableData = [
    {
      id: 1,
      patient: {
        name: "Trith Shah",
        email: "tirth@gmail.com",
        initials: "TS",
        color: "bg-purple-500"
      },
      doctor: {
        name: "Shikha Pandey",
        email: "shikha@gmail.com",
        initials: "SP",
        color: "bg-red-400"
      },
      department: "Cardiologist & Diabetologist",
      date: "5:00 PM · 10th Mar, 2025",
      status: "Confirmed"
    },
    {
      id: 2,
      patient: {
        name: "Trith Shah",
        email: "tirth@gmail.com",
        initials: "TS",
        color: "bg-purple-500"
      },
      doctor: {
        name: "Hello Nice",
        email: "nicehello@gmail.com",
        initials: "HN",
        color: "bg-teal-400"
      },
      department: "Assumenda eius incid",
      date: "11:00 AM · 22nd Feb, 2025",
      status: "Canceled"
    }
  ];

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
    <div className="flex flex-col">
      {/* Navbar Component */}
      <PatientNavbar pageTitle="View Appointments" />

      <div className="flex">
        <Sidebar />
        <div className="container mx-auto p-4 flex-1">
          {/* Header with search and buttons */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search patients..."
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

          {/* Table */}
          <EnhancedTable
            columns={columns}
            data={tableData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showActions={true}
            striped={false}
            hoverable={true}
            bordered={true}
            renderActions={customActions}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewAppointment;
