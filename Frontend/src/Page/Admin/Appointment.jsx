import React, { useState, useEffect } from 'react';
import ReusableTable from '../../Component/Table';
import Sidebar from '../../Component/Sidebar';
import { baseUrl } from '../../Constant/Constant';
import { Search, Filter } from 'lucide-react';

const ViewAppointmentlist = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All Statuses',
    payment: 'All Payments',
    date: ''
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${baseUrl}appointments/getAppointment`);
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const data = await response.json();
        setAppointments(data);
        setFilteredData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const results = appointments.filter(appointment => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        (appointment.bookedPatient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.bookedDoctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.appointmentDate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.approvedByAdmin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.payment?.status?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = filters.status === 'All Statuses' || 
        appointment.approvedByAdmin === filters.status;
      
      // Payment filter
      const matchesPayment = filters.payment === 'All Payments' || 
        appointment.payment?.status === filters.payment;
      
      // Date filter (simple implementation)
      const matchesDate = filters.date === '' || 
        appointment.appointmentDate?.includes(filters.date);
      
      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
    setFilteredData(results);
  }, [searchTerm, appointments, filters]);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'All Statuses',
      payment: 'All Payments',
      date: ''
    });
    setSearchTerm('');
  };

  const columns = [
    { header: 'PATIENT', accessor: 'patientName' },
    { header: 'DOCTOR', accessor: 'doctorName' },
    { header: 'DEPARTMENT', accessor: 'department' },
    { header: 'DATE&Time', accessor: 'appointmentDate' },
    { 
        header: 'STATUS', 
        accessor: 'status',
        cell: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
            {row.status}
          </span>
        )
      },
      { 
        header: 'PAYMENT', 
        accessor: 'paymentStatus',
        cell: (row) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.paymentStatus)}`}>
            {row.paymentStatus}
          </span>
        )
      },
    ];

  // Transform the API data to match the table structure
  const tableData = filteredData.map(appointment => ({
    patientName: appointment.bookedPatient?.name || 'N/A',
    doctorName: appointment.bookedDoctor?.name || 'N/A',
    department: appointment.bookedDoctor?.specialist || 'N/A',
    appointmentDate: `${appointment.appointmentDate} ${appointment.appointmentTime}`,
    status: appointment.approvedByAdmin || 'N/A',
    paymentStatus: appointment.payment?.status || 'N/A',
    originalData: appointment
  }));

  const handleEdit = (row) => {
    console.log('Edit:', row.originalData);
  };

  const handleDelete = (row) => {
    console.log('Delete:', row.originalData);
  };

  const handleView = (row) => {
    console.log('View:', row.originalData);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading appointments...</div>;
  if (error) return <div className="flex justify-center items-center h-screen">Error: {error}</div>;

  return (
    <div className="flex">
      <Sidebar role="admin" />
      
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-3">Appointments</h1>
          
          <div className="flex justify-between items-center">
            {/* Search Bar - Now on the left side under heading */}
            <div className="relative w-full md:w-1/2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-[#e7faf7] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter Button - Now on the right side */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2dd4bf] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ml-4"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Dropdown (conditionally shown) */}
        {showFilters && (
          <div className="bg-white p-4 rounded-md shadow-md mb-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                >
                  <option>All Statuses</option>
                  <option>Pending</option>
                  <option>Accepted</option>
                  <option>Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                <select 
                  name="payment"
                  value={filters.payment}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                >
                  <option>All Payments</option>
                  <option>Paid</option>
                  <option>Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 rounded-md text-sm font-medium mr-2"
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-[#2dd4bf] text-white rounded-md text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <ReusableTable
          columns={columns}
          data={tableData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClick={handleView}
          striped={true}
          hoverable={true}
          bordered={true}
        />
      </div>
    </div>
  );
};

export default ViewAppointmentlist;