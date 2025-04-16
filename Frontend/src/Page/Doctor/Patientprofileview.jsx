import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, Bell, Share2 } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../../Component/Sidebar'; // Import the Sidebar component

function Patientprofiledoctor() {
    const { id } = useParams(); // Extract patient ID from URL
    const [patientData, setPatientData] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [labReports, setLabReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('appointment'); // For toggling between appointments and lab reports

    useEffect(() => {
        // Fetch patient appointments using the ID from URL
        const fetchPatientData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:4000/api/appointments/getAppointment`, {
                    params: { patientId: id }
                });
                
                // Set patient data from the first appointment if available
                if (response.data && response.data.length > 0) {
                    setPatientData(response.data[0].bookedPatient);
                    setAppointments(response.data);
                    
                    // Once we have patient data, fetch lab reports using patientId
                    if (response.data[0].bookedPatient.patientId) {
                        fetchLabReports(response.data[0].bookedPatient.patientId);
                    }
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to load patient data');
                setLoading(false);
                console.error('Error fetching patient data:', err);
            }
        };

        const fetchLabReports = async (patientId) => {
            try {
                const labResponse = await axios.get('http://localhost:4000/api/labresult/getall');
                if (labResponse.data && labResponse.data.success) {
                    // Filter lab reports for this specific patient
                    const patientLabReports = labResponse.data.data.filter(
                        report => report.patientId === patientId
                    );
                    setLabReports(patientLabReports);
                }
            } catch (err) {
                console.error('Error fetching lab reports:', err);
            }
        };

        if (id) {
            fetchPatientData();
        }
    }, [id]);

    if (loading) return (
        <div className="flex h-screen">
            <div className="fixed h-full">
                <Sidebar role="doctor" />
            </div>
            <div className="flex-1 ml-64 flex justify-center items-center">Loading patient data...</div>
        </div>
    );
    
    if (error) return (
        <div className="flex h-screen">
            <div className="fixed h-full">
                <Sidebar role="doctor" />
            </div>
            <div className="flex-1 ml-64 flex justify-center items-center text-red-500">{error}</div>
        </div>
    );
    
    if (!patientData) return (
        <div className="flex h-screen">
            <div className="fixed h-full">
                <Sidebar role="doctor" />
            </div>
            <div className="flex-1 ml-64 flex justify-center items-center">No patient data found</div>
        </div>
    );

    return (
        <div className="flex h-screen">
            {/* Fixed Sidebar */}
            <div className="fixed h-full">
                <Sidebar role="doctor" />
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 ml-64 overflow-y-auto bg-gray-100">
                <div className="p-4 md:p-8">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Profile Card */}
                        <div className="bg-[#2E86C1] rounded-lg p-6 text-white text-center">
                            <div className="relative w-24 h-24 mx-auto mb-4">
                                <img
                                    src="/api/placeholder/200/200"
                                    alt="Profile"
                                    className="rounded-full w-full h-full object-cover"
                                />
                                <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full">
                                    <Share2 className="w-4 h-4 text-[#2E86C1]" />
                                </button>
                            </div>
                            <h2 className="text-xl font-bold mb-1">{patientData.name}</h2>
                            <p className="text-sm mb-4">{patientData.email}</p>
                            <button className="bg-[#27AE60] text-white px-6 py-2 rounded-full w-full">
                                Send Message
                            </button>
                        </div>

                        {/* Info Card */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-600 text-sm">Gender</p>
                                    <p className="font-medium">{patientData.personalinfo?.gender || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Birth date</p>
                                    <p className="font-medium">{patientData.personalinfo?.dobAD || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Phone No</p>
                                    <p className="font-medium">{patientData.phone}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Patient Id</p>
                                    <p className="font-medium">{patientData.patientId}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Address</p>
                                    <p className="font-medium">{`${patientData.personalinfo?.address || ''}, ${patientData.personalinfo?.ward || ''}`}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Registered Date</p>
                                    <p className="font-medium">{new Date(patientData.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Notes Card */}
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Medical Notes</h3>
                            <ul className="space-y-2">
                                {patientData.personalinfo?.medicalConditions && (
                                    <li className="text-gray-700">{patientData.personalinfo.medicalConditions}</li>
                                )}
                                {patientData.personalinfo?.allergies && (
                                    <li className="text-gray-700">Allergies: {patientData.personalinfo.allergies}</li>
                                )}
                                {patientData.personalinfo?.bloodGroup && (
                                    <li className="text-gray-700">Blood Group: {patientData.personalinfo.bloodGroup}</li>
                                )}
                                {patientData.personalinfo?.majorSurgery && patientData.personalinfo.majorSurgery !== "None" && (
                                    <li className="text-gray-700">Major Surgery: {patientData.personalinfo.majorSurgery}</li>
                                )}
                                {(!patientData.personalinfo?.medicalConditions && 
                                !patientData.personalinfo?.allergies && 
                                !patientData.personalinfo?.majorSurgery) && (
                                    <li className="text-gray-700">No medical notes available</li>
                                )}
                            </ul>
                        </div>

                        {/* Records Section */}
                        <div className="md:col-span-3">
                            <div className="bg-[#B2D6D7] rounded-lg p-2">
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <button 
                                        className={`${activeTab === 'appointment' ? 'bg-white' : ''} rounded py-2 font-medium`}
                                        onClick={() => setActiveTab('appointment')}
                                    >
                                        Appointment
                                    </button>
                                    <button 
                                        className={`${activeTab === 'lab' ? 'bg-white' : ''} text-gray-700 py-2 font-medium`}
                                        onClick={() => setActiveTab('lab')}
                                    >
                                        Lab Report
                                    </button>
                                </div>
                            </div>

                            {/* Appointment Timeline */}
                            {activeTab === 'appointment' && (
                                <div className="mt-6 space-y-4">
                                    {appointments.length > 0 ? (
                                        appointments.map((appointment, index) => (
                                            <div 
                                                key={appointment._id} 
                                                className={`relative pl-8 border-l-2 ${index === 0 ? 'border-blue-400' : 'border-blue-200'}`}
                                            >
                                                <div className={`absolute left-[-8px] top-2 w-4 h-4 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-blue-200'}`}></div>
                                                <div className="bg-white rounded-lg p-4 shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-semibold">{appointment.appointmentDate}</h4>
                                                            <p className="text-sm text-gray-500">{appointment.appointmentTime}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium">Doctor</p>
                                                            <p className="text-sm text-gray-600">{appointment.bookedDoctor.name}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="text-gray-600 text-sm">Consultation Status</p>
                                                        <p className="font-medium capitalize">{appointment.consultationStatus || "Visit Dr for consultation"}</p>
                                                    </div>
                                                    {appointment.consultationNotes && (
                                                        <div className="mt-2">
                                                            <p className="text-gray-600 text-sm">Consultation Notes</p>
                                                            <p className="text-gray-700">{appointment.consultationNotes}</p>
                                                        </div>
                                                    )}
                                                    <div className="mt-2">
                                                        <p className="text-gray-600 text-sm">Appointment Type</p>
                                                        <p className="text-gray-700">{appointment.appointmentType}</p>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="text-gray-600 text-sm">Reason</p>
                                                        <p className="text-gray-700">{appointment.appointmentReason}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                                            <p>No appointment history found</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Lab Reports */}
                            {activeTab === 'lab' && (
                                <div className="mt-6">
                                    {labReports.length > 0 ? (
                                        labReports.map((report) => (
                                            <div key={report._id} className="bg-white rounded-lg p-4 shadow-sm mb-4">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{report.testType}</h3>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(report.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-sm ${
                                                        report.reportStatus === 'Normal' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {report.reportStatus}
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-gray-600 text-sm">Referring Doctor</p>
                                                    <p className="font-medium">{report.referringDoctor}</p>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-gray-600 text-sm">Findings</p>
                                                    <p className="font-medium">{report.findings}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600 text-sm mb-2">Parameters</p>
                                                    <table className="min-w-full border-collapse">
                                                        <thead>
                                                            <tr className="bg-gray-50">
                                                                <th className="py-2 px-4 border text-left">Parameter</th>
                                                                <th className="py-2 px-4 border text-left">Result</th>
                                                                <th className="py-2 px-4 border text-left">Reference Range</th>
                                                                <th className="py-2 px-4 border text-left">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {report.parameters.map((param, idx) => (
                                                                <tr key={idx}>
                                                                    <td className="py-2 px-4 border">{param.parameter}</td>
                                                                    <td className="py-2 px-4 border">{param.result}</td>
                                                                    <td className="py-2 px-4 border">{param.referenceRange}</td>
                                                                    <td className={`py-2 px-4 border ${
                                                                        param.status === 'Normal' 
                                                                            ? 'text-green-600' 
                                                                            : 'text-red-600'
                                                                    }`}>
                                                                        {param.status}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                                            <p>No lab reports found for this patient</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Patientprofiledoctor;