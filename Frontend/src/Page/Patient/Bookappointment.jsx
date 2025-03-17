import React, { useState, useEffect } from 'react';
import { Star, Clock, Calendar, ChevronRight, Clock3 } from 'lucide-react';
import Sidebar from '../../Component/Sidebar';
import PatientNavbar from '../../Component/Patientnavbar';

function BookAppointment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Doctors');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState(['All Doctors']);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

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
          availability: [doctor.availableTime, 'Online Consult'],
          availableTime: doctor.availableTime
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
  useEffect(() => {
    if (selectedDoctor) {
      const timeSlots = generateTimeSlots(selectedDoctor.availableTime);
      setAvailableTimeSlots(timeSlots);
    }
  }, [selectedDoctor]);

  // Function to parse time range and generate 25-minute slots
  const generateTimeSlots = (availableTime) => {
    // Parse the time range (e.g., "7am-10am")
    const timeRangeMatch = availableTime.match(/(\d+)([ap]m)-(\d+)([ap]m)/i);
    
    if (!timeRangeMatch) return [];
    
    let startHour = parseInt(timeRangeMatch[1]);
    const startPeriod = timeRangeMatch[2].toLowerCase();
    let endHour = parseInt(timeRangeMatch[3]);
    const endPeriod = timeRangeMatch[4].toLowerCase();
    
    // Convert to 24-hour format
    if (startPeriod === 'pm' && startHour !== 12) startHour += 12;
    if (startPeriod === 'am' && startHour === 12) startHour = 0;
    if (endPeriod === 'pm' && endHour !== 12) endHour += 12;
    if (endPeriod === 'am' && endHour === 12) endHour = 0;
    
    const slots = [];
    let currentHour = startHour;
    let currentMinute = 0;
    
    // Generate slots every 25 minutes
    while (currentHour < endHour || (currentHour === endHour && currentMinute === 0)) {
      // Format the time
      let hour = currentHour;
      const period = hour >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      if (hour > 12) hour -= 12;
      if (hour === 0) hour = 12;
      
      // Add the slot
      slots.push(`${hour}:${currentMinute.toString().padStart(2, '0')} ${period}`);
      
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

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(2);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === step
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
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
            <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{doctor.name}</h3>
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
                </div>

                <div className="flex flex-wrap gap-2">
                  {doctor.availability.map((status, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {status === 'Online Consult' && <Calendar className="w-4 h-4" />}
                      {status}
                    </span>
                  ))}
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
        <h2 className="text-2xl font-semibold mb-6">Select Date & Time</h2>
        
        {selectedDoctor && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg mb-6">
            <img
              src={selectedDoctor.image}
              alt={selectedDoctor.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold">{selectedDoctor.name}</h3>
              <span className="text-gray-600">{selectedDoctor.specialty}</span>
              <p className="text-blue-600 text-sm mt-1">Available: {selectedDoctor.availableTime}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
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
                onClick={() => setSelectedTime(time)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md border ${
                  selectedTime === time
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

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            disabled={!selectedDate || !selectedTime}
            className={`px-6 py-2 rounded-md text-white flex items-center gap-2 ${
              selectedDate && selectedTime
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;