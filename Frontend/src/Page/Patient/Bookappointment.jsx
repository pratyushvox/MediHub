import React, { useState, useEffect } from 'react';
import { Star, Clock, Calendar, ChevronRight, Clock3, DollarSign, MapPin, Video, MessageSquare,CreditCard, Wallet } from 'lucide-react';
import Sidebar from '../../Component/Sidebar';
import PatientNavbar from '../../Component/Patientnavbar';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


function BookAppointment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Doctors');
  const [bookedPatient, setBookedPaitent] = useState(null);
  const [bookedDoctorData, setBookedDoctorData] = useState(null);
  const [bookedDoctor, setBookedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [price, setPrice] = useState('');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState(['All Doctors']);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch doctors from API
    const fetchDoctors = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/doctor/getdoctor');
        const data = await response.json();
        
        // Transform API data to match our component structure
        const formattedDoctors = data.map(doctor => ({
          id: doctor._id,
          name: doctor.name,
          specialty: doctor.specialist,
          rating: 4.8, // Default rating since API doesn't provide this
          reviews: Math.floor(Math.random() * 100) + 50, // Random reviews count since API doesn't provide this
          experience: doctor.experience,
          // Using placeholder image since API doesn't provide images
          image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=300',
          availableTime: doctor.availableTime,
          price: doctor.price , // Use price from backend or default if not available
          location: doctor.location || 'Medical Center, Floor 3', // Add location for physical visits
          availableTypes: ['Physical Visit', 'Online Consultation'],
          bookedslots: doctor.bookedslots || []
           // Both types of consultations
        }));
        
        setDoctors(formattedDoctors);
        
        // Extract unique specialties for the filter
        const uniqueSpecialties = ['All Doctors', ...new Set(formattedDoctors.map(doc => doc.specialty))];
        setSpecialties(uniqueSpecialties);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);

  // Generate time slots when doctor is selected
  // In the useEffect that generates time slots:
useEffect(() => {
  if (bookedDoctorData && appointmentDate) {
    // Filter booked slots for the selected date
    const bookedSlotsForDate = bookedDoctorData.bookedslots
      ?.filter(slot => slot.date === appointmentDate)
      .map(slot => slot.time) || [];

    // Generate available time slots excluding the booked ones for this date
    const timeSlots = generateTimeSlots(
      bookedDoctorData.availableTime,
      bookedSlotsForDate // Pass only the booked times for this date
    );

    setAvailableTimeSlots(timeSlots);
  }
}, [bookedDoctorData, appointmentDate]);

// Updated generateTimeSlots function:
const generateTimeSlots = (availableTime, bookedTimes = []) => {
  // Parse the time range (e.g., "7am-10am")
  const timeRangeMatch = availableTime.match(/(\d+)([ap]m)-(\d+)([ap]m)/i);
  if (!timeRangeMatch) return [];

  let startHour = parseInt(timeRangeMatch[1]);
  const startPeriod = timeRangeMatch[2].toLowerCase();
  let endHour = parseInt(timeRangeMatch[3]);
  const endPeriod = timeRangeMatch[4].toLowerCase();

  // Convert to 24-hour format
  if (startPeriod === "pm" && startHour !== 12) startHour += 12;
  if (startPeriod === "am" && startHour === 12) startHour = 0;
  if (endPeriod === "pm" && endHour !== 12) endHour += 12;
  if (endPeriod === "am" && endHour === 12) endHour = 0;

  const slots = [];
  let currentHour = startHour;
  let currentMinute = 0;

  // Generate slots every 25 minutes
  while (currentHour < endHour || (currentHour === endHour && currentMinute === 0)) {
    let hour = currentHour;
    const period = hour >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    // Format the time
    const timeSlot = `${hour}:${currentMinute.toString().padStart(2, "0")} ${period}`;

    // Only add slot if it's not booked
    if (!bookedTimes.includes(timeSlot)) {
      slots.push(timeSlot);
    }

    // Increment by 25 minutes
    currentMinute += 25;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = currentMinute - 60;
    }
  }

  return slots;
};

  
  

  const filteredDoctors = selectedSpecialty === 'All Doctors' 
    ? doctors 
    : doctors.filter(doctor => doctor.specialty === selectedSpecialty);

  // In handleDoctorSelect function
const handleDoctorSelect = (doctor) => {
  setBookedDoctorData(doctor);
  setBookedDoctor(doctor.id); // Add this line
  setCurrentStep(2);
};
  
  const handleContinueToStep3 = () => {
    if (appointmentDate && appointmentTime && appointmentType) {
      setCurrentStep(3);
    }
  };

  useEffect(() => {
    if (bookedDoctorData) {
      setPrice(bookedDoctorData.price);
    }
  }, [bookedDoctorData]); // ✅ Runs only when `bookedDoctorData` changes
  


  useEffect(() => {
    const userId = localStorage.getItem("Userid");
    setBookedPaitent(userId);
  }, []); 

  const handleBookAppointment = async (selectedPaymentMethod) => {
    try {
      setPaymentMethod(selectedPaymentMethod);
      setShowPaymentDialog(false);
      
      // 1. First create the appointment
      const appointmentRes = await fetch("http://localhost:4000/api/appointments/createAppointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          bookedPatient,
          bookedDoctor,
          appointmentType,
          appointmentReason,
          appointmentDate,
          appointmentTime,
          paymentMethod: selectedPaymentMethod,
          price,
        }),
      });
      
      const appointmentData = await appointmentRes.json();
      
      if (!appointmentRes.ok) {
        throw new Error(appointmentData.message || "Failed to create appointment");
      }
      
      console.log("Appointment created successfully:", appointmentData);
      
      // 2. Handle Khalti payment
      if (selectedPaymentMethod === "Khalti") {
        try {
          // Increased delay to ensure the appointment is saved in the database
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Store appointment ID in a variable to ensure it's correctly passed
          const appointmentId = appointmentData.appointment._id || appointmentData._id;
          
          if (!appointmentId) {
            throw new Error("No appointment ID received from server");
          }
          
          console.log("Initiating payment for appointment ID:", appointmentId);
          
          const paymentRes = await fetch("http://localhost:4000/api/payment/khalti/initiate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
              appointmentId: appointmentId,
              // Include additional appointment info as fallback
              appointmentDetails: {
                patient: bookedPatient,
                doctor: bookedDoctor,
                date: appointmentDate,
                time: appointmentTime,
                price: price
              }
            }),
          });
          
          // Check if request failed and handle the error
          if (!paymentRes.ok) {
            const paymentError = await paymentRes.json();
            console.error("Payment initiation response:", paymentError);
            throw new Error(paymentError.message || "Payment initiation failed");
          }
          
          const paymentData = await paymentRes.json();
          console.log("Payment initiated successfully:", paymentData);
          
          if (paymentData.payment_url) {
            // Redirect to Khalti payment page
            window.location.href = paymentData.payment_url;
          } else {
            throw new Error("No payment URL received from Khalti");
          }
        } catch (paymentError) {
          console.error("Payment processing error:", paymentError);
          // Show more specific error to user
          toast.error(`Payment processing failed: ${paymentError.message}`);
          // Still allow them to continue to confirmation or retry
          if (window.confirm("Payment processing failed. Would you like to try again or continue with offline payment?")) {
            setPaymentMethod("Cash");
            setCurrentStep(5);
          } else {
            setCurrentStep(3);
          }
        }
      } else {
        // For offline payments
        setCurrentStep(5);
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(`Booking failed: ${error.message}`);
      setCurrentStep(3);
    }
  };
    
  

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2, 3, 4,   5].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === step
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 5 && (
            <div className="w-12 h-0.5 bg-gray-200 mx-2" />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Select a Doctor</h2>
          <div className="flex flex-wrap gap-2 bg-gray-200 p-1 rounded-lg">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedSpecialty === specialty
                    ? 'bg-white shadow-sm'
                    : 'hover:bg-gray-300'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id}
            onClick={() => {
              setPrice(doctor?.price);
              setBookedDoctor(doctor?.id);
            }
            }
            className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
  <img
    src={doctor.image}
    alt={doctor.name}
    className="w-20 h-20 rounded-full object-cover"
  />
  <div>
    <h3 
      className="text-xl font-semibold hover:text-blue-600 cursor-pointer"
      onClick={() => navigate(`/Patient/Doctor/${doctor.id}`)}
    >
      {doctor.name}
    </h3>
    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
      {doctor.specialty}
    </span>
  </div>
</div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{doctor.rating}</span>
                    <span className="text-gray-500">({doctor.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-800 font-medium">
                    
                    <span>Consultation fee: {doctor.price}</span>
                  </div>
                  
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {doctor.availableTypes.map((type, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {type === 'Online Consultation' ? 
                        <Video className="w-4 h-4" /> : 
                        <MapPin className="w-4 h-4" />
                      }
                      {type}
                    </span>
                  ))}
                </div>
                
                <div className="text-blue-600 text-sm">
                  Available: {doctor.availableTime}
                </div>
              </div>
              
              <div className="border-t p-4">
                <button 
                  onClick={() => handleDoctorSelect(doctor)}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Select Appointment Details</h2>
        
        {bookedDoctorData && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg mb-6">
            <img
              src={bookedDoctorData.image}
              alt={bookedDoctorData.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{bookedDoctorData.name}</h3>
              <span className="text-gray-600">{bookedDoctorData.specialty}</span>
              <div className="flex items-center justify-between mt-2">
                <p className="text-blue-600 text-sm">Available: {bookedDoctorData.availableTime}</p>
                <p className="text-green-600 text-sm font-medium flex items-center">
                  {bookedDoctorData.price}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAppointmentType('Physical Visit')}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border ${
                  appointmentType === 'Physical Visit'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Physical Visit</span>
              </button>
              <button
                type="button"
                onClick={() => setAppointmentType('Online Consultation')}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border ${
                  appointmentType === 'Online Consultation'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <Video className="w-5 h-5" />
                <span className="font-medium">Online Consultation</span>
              </button>
            </div>
            
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Time Slots
            </label>
            <div className="grid grid-cols-3 gap-3">
              {availableTimeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setAppointmentTime(time)}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md border ${
                    appointmentTime === time
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  <Clock3 className="w-4 h-4" />
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleContinueToStep3}
            disabled={!appointmentDate || !appointmentTime || !appointmentType}
            className={`px-6 py-2 rounded-md text-white flex items-center gap-2 ${
              appointmentDate && appointmentTime && appointmentType
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Appointment Details</h2>
        
        {bookedDoctorData && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg mb-6">
            <img
              src={bookedDoctorData.image}
              alt={bookedDoctorData.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{bookedDoctorData.name}</h3>
              <span className="text-gray-600">{bookedDoctorData.specialty}</span>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center text-blue-600 text-sm">
                  <Calendar className="w-4 h-4 mr-1" /> {appointmentDate} at {appointmentTime}
                </span>
                <span className="inline-flex items-center text-blue-600 text-sm">
                  {appointmentType === 'Physical Visit' ? 
                    <><MapPin className="w-4 h-4 mr-1" /> Physical Visit</> : 
                    <><Video className="w-4 h-4 mr-1" /> Online Consultation</>
                  }
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Appointment *
          </label>
          <textarea
            value={appointmentReason}
            onChange={(e) => setAppointmentReason(e.target.value)}
            placeholder="Please describe your symptoms or reason for this appointment..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            This information helps your doctor prepare for your appointment.
          </p>
        </div>
  
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2 flex items-center">
            <DollarSign className="w-5 h-5 text-green-600 mr-1" />
            Payment Summary
          </h3>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-700">Consultation Fee</span>
            <span className="font-medium">{bookedDoctorData?.price}</span>
          </div>
          <div className="flex justify-between py-2 mt-2">
            <span className="text-gray-900 font-medium">Total</span>
            <span className="text-green-600 font-bold">
              {bookedDoctorData?.price} {/* Only show the doctor's price */}
            </span>
          </div>
        </div>
  
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(2)}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          <button
  onClick={() => {
    if (appointmentReason.trim()) {
      setShowPaymentDialog(true);
    }
  }}
  disabled={!appointmentReason.trim()}
  className={`px-6 py-2 rounded-md text-white flex items-center gap-2 ${
    appointmentReason.trim()
      ? 'bg-blue-600 hover:bg-blue-700'
      : 'bg-gray-400 cursor-not-allowed'
  }`}
>
  Confirm & Pay <ChevronRight className="w-4 h-4" />
</button>

        </div>
      </div>
    </div>
  );
  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="mb-6">
  <h4 className="font-medium mb-2">Next Steps:</h4>
  {paymentMethod === 'Khalti' ? (
    <p className="text-sm text-gray-600">
      Your payment was successful. You'll receive a confirmation email shortly.
    </p>
  ) : (
    <p className="text-sm text-gray-600">
      Please visit the clinic 10 minutes before your appointment time with your payment.
    </p>
  )}
</div>
        
        {bookedDoctorData && (
          <div className="max-w-sm mx-auto bg-blue-50 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <p className="font-medium">{bookedDoctorData.name}</p>
              <div className="flex justify-between text-sm">
                <span>Appointment Type:</span>
                <span className="font-medium">{appointmentType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date & Time:</span>
                <span className="font-medium">{appointmentDate} at {appointmentTime}</span>
              </div>
              {appointmentType === 'Physical Visit' && (
                <div className="flex justify-between text-sm">
                  <span>Location:</span>
                  <span className="font-medium">{bookedDoctorData.location}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Total Fee:</span>
                <span className="font-medium text-green-600">
                  ${(parseFloat(bookedDoctorData?.price?.replace('$', '')) + 5).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-sm mx-auto bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-medium mb-2 flex items-center">
            <MessageSquare className="w-5 h-5 text-blue-600 mr-1" />
            Your Reason for Visit
          </h3>
          <p className="text-gray-700 text-sm">{appointmentReason}</p>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Book Another
          </button>
          <button
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            View Appointments
          </button>
        </div>
      </div>
    </div>
    
  );
  const renderPaymentDialog = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 className="text-xl font-semibold mb-4">Select Payment Method</h3>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={() => {
            setPaymentMethod('Khalti');
            setShowPaymentDialog(false);
            handleBookAppointment('Khalti');
          }}
          className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-blue-500"
        >
          <div className="flex items-center gap-3">
            <img 
              src="/khalti-logo.png" 
              alt="Khalti" 
              className="h-6" 
            />
            <span>Pay with Khalti</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
        
        <button
          onClick={() => {
            setPaymentMethod('Cash');
            setShowPaymentDialog(false);
            handleBookAppointment('Cash');
          }}
          className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:border-blue-500"
        >
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-green-600" />
            <span>Pay at Clinic</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  </div>
);
  
  const renderStep5 = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-semibold mb-2">Appointment Request Sent!</h2>
        <p className="text-gray-600 mb-4">Your appointment request has been sent to the clinic.</p>
        <p className="text-gray-600 mb-6">Please pay the consultation fee when you visit the clinic.</p>
        
        {bookedDoctorData && (
          <div className="max-w-sm mx-auto bg-blue-50 rounded-lg p-4 mb-6">
            <div className="space-y-2">
              <p className="font-medium">{bookedDoctorData.name}</p>
              <div className="flex justify-between text-sm">
                <span>Appointment Type:</span>
                <span className="font-medium">{appointmentType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Date & Time:</span>
                <span className="font-medium">{appointmentDate} at {appointmentTime}</span>
              </div>
              {appointmentType === 'Physical Visit' && (
                <div className="flex justify-between text-sm">
                  <span>Location:</span>
                  <span className="font-medium">{bookedDoctorData.location}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Fee to Pay:</span>
                <span className="font-medium text-green-600">{bookedDoctorData.price}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Book Another
          </button>
          <button
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            View Appointments
          </button>
        </div>
      </div>
    </div>
  );
  
   

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Navbar at the top */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <PatientNavbar />
      </div>

      {/* Sidebar and Main Content */}
      <div className="flex pt-16"> {/* Add padding-top to account for the fixed navbar */}
        {/* Fixed Sidebar on the left */}
        <div className="fixed left-0 top-16 h-screen w-64 z-40">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8"> {/* Add margin-left to account for the fixed sidebar */}
          <div className="max-w-6xl mx-auto">
            {renderStepIndicator()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>
        </div>
      </div>
      {showPaymentDialog && renderPaymentDialog()}
    </div>
  );
}

export default BookAppointment;