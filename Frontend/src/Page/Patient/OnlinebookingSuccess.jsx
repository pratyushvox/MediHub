import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Import Sidebar with correct path
import Sidebar from "../../Component/Sidebar"; // Adjust the import path as needed
import PatientNavbar from "../../Component/Patientnavbar"; // Adjust the import path as needed

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/appointments/getAppointment?appointmentId=${appointmentId}`
        );
        
        // Fix: Check if response.data is an array and take first element
        if (Array.isArray(response.data)) {
          setAppointment(response.data[0]);
        } else {
          setAppointment(response.data);
        }
      } catch (err) {
        console.error("Error fetching appointment:", err);
        setError("Failed to fetch appointment details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    } else {
      setError("Invalid appointment ID.");
      setLoading(false);
    }
  }, [appointmentId]);

  return (
    <div className="flex">
      {/* Explicitly pass 'patient' role to Sidebar */}
      <Sidebar role="patient" />
      
      <div className="flex-1">
        <PatientNavbar />
        <div className="p-6">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : !appointment ? (
            <p>No appointment data found.</p>
          ) : (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-gray-100">
              <div className="bg-white p-6 rounded-lg shadow-md max-w-lg text-center">
                <div className="text-3xl font-bold text-[#357BA6]">Appointment Confirmed!</div>
                <p className="mt-2 text-gray-600">
                  Your appointment is successfully booked. Please visit the clinic at
                  your scheduled time.
                </p>
                <div className="mt-4 p-4 bg-[#82CFCA] rounded-lg text-left text-gray-800">
                  <p><strong>Patient:</strong> {appointment?.bookedPatient?.name}</p>
                  <p><strong>Doctor:</strong> {appointment?.bookedDoctor?.name}</p>
                  <p><strong>Specialist:</strong> {appointment?.bookedDoctor?.specialist}</p>
                  <p><strong>Date & Time:</strong> {appointment?.appointmentDate} at {appointment?.appointmentTime}</p>
                  <p><strong>Location:</strong> {appointment?.bookedDoctor?.address}</p>
                  <p><strong>Paid Amount:</strong> NPR {appointment?.price}</p>
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    className="bg-[#357BA6] text-white px-4 py-2 rounded-lg"
                    onClick={() => navigate("/Patient/BookAppointment")}
                  >
                    Book Another
                  </button>
                  <button
                    className="border border-gray-500 px-4 py-2 rounded-lg"
                    onClick={() => navigate("/patient/viewappointments")}
                  >
                    View Appointments
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;