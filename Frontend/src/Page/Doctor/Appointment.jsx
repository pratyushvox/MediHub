import React, { useState, useEffect } from 'react';
import { baseUrl } from '../../Constant/Constant';
import { Filter } from 'lucide-react';
import Sidebar from '../../Component/Sidebar';

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId');
        if (!doctorId) {
          console.error('Doctor ID not found in storage');
          return;
        }

        const response = await fetch(`${baseUrl}appointments/getAppointment`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug: Log the API response
        
        // Filter appointments for the current doctor
        const doctorAppointments = data.filter(
          appt => appt.bookedDoctor?._id === doctorId
        );

        console.log('Filtered Appointments:', doctorAppointments); // Debug: Log filtered appointments
        setAppointments(doctorAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filterAppointments = () => {
    let filtered = appointments;
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(appt => {
        const patientName = appt.bookedPatient?.name?.toLowerCase() || '';
        const appointmentDate = appt.appointmentDate?.toLowerCase() || '';
        return (
          patientName.includes(searchTerm.toLowerCase()) ||
          appointmentDate.includes(searchTerm.toLowerCase())
        );
      });
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(appt => 
        appt.consultationStatus?.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    return filtered;
  };

  const filteredAppointments = filterAppointments();

  return (
    <div className="flex">
      {/* Import Sidebar with doctor role */}
      <Sidebar role="doctor" />
      
      {/* Main content */}
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Appointments</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">Loading appointments...</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <div className="flex-grow max-w-md relative">
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className="px-4 py-2 border rounded-md w-full bg-[#e6f9f7]" /* Light variant of #42d8c5 */
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  className="flex items-center px-4 py-2 bg-[#42d8c5] text-white rounded-md hover:bg-[#3bc0af] transition-colors"
                  onClick={() => setFilterStatus('all')}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  All
                </button>
                <button
                  className="flex items-center px-4 py-2 bg-[#42d8c5] text-white rounded-md hover:bg-[#3bc0af] transition-colors"
                  onClick={() => setFilterStatus('pending')}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Pending
                </button>
                <button
                  className="flex items-center px-4 py-2 bg-[#42d8c5] text-white rounded-md hover:bg-[#3bc0af] transition-colors"
                  onClick={() => setFilterStatus('completed')}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Completed
                </button>
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p>No appointments match your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-[#e6f9f7]"> {/* Light variant of #42d8c5 */}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">PATIENT</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">REASON</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">CONSULTATION STATUS</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">PAYMENT STATUS</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">DATE/TIME</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">PHONE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAppointments.map((appointment, index) => (
                      <tr key={appointment._id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f7fdfc]'}>
                        <td className="px-4 py-2 whitespace-nowrap">{appointment.bookedPatient?.name || 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{appointment.appointmentReason || 'N/A'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.consultationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            appointment.consultationStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {appointment.consultationStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.payment?.status === 'Completed' || appointment.khaltiPid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.payment?.status || (appointment.khaltiPid ? 'Paid' : 'Pending')}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {`${appointment.appointmentDate || 'N/A'} ${appointment.appointmentTime || ''}`}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{appointment.bookedPatient?.phone || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorAppointmentsPage;