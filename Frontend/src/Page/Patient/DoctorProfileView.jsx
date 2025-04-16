import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Send, Users, Calendar, Clock, MapPin, Mail, Phone } from 'lucide-react';
import PatientNavbar from '../../Component/Patientnavbar';
import Sidebar from '../../Component/Sidebar';

function Doctorprofilenadreview() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState([
    { icon: Calendar, label: "Appointments", value: "Loading..." },
    { icon: Users, label: "Patients Treated", value: "Loading..." },
    { icon: Clock, label: "Experience", value: "Loading..." },
  ]);
  const [submitStatus, setSubmitStatus] = useState({
    isSubmitting: false,
    message: '',
    isError: false
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('Userid');
        if (userId) {
          const userResponse = await fetch(`http://localhost:4000/api/users/${userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserData(userData);
          } else {
            console.error("Failed to fetch user data");
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        // Fetch doctor data first
        const doctorRes = await fetch(`http://localhost:4000/api/doctor/${id}`);
        if (!doctorRes.ok) throw new Error('Failed to fetch doctor data');
        const doctorData = await doctorRes.json();
        setDoctor(doctorData);

        // Fetch appointments for this doctor
        const appointmentsRes = await fetch('http://localhost:4000/api/appointments/getAppointment');
        if (!appointmentsRes.ok) throw new Error('Failed to fetch appointments');
        const appointmentsData = await appointmentsRes.json();
        
        // Filter appointments for this doctor
        const doctorAppointments = appointmentsData.filter(
          appt => appt.bookedDoctor._id === id
        );
        setAppointments(doctorAppointments);

        // Calculate completed appointments
        const completedAppointments = doctorAppointments.filter(
          appt => appt.consultationStatus === 'completed'
        ).length;

        // Set stats based on actual data
        setStats([
          { icon: Calendar, label: "Appointments", value: doctorAppointments.length },
          { icon: Users, label: "Patients Treated", value: completedAppointments },
          { icon: Clock, label: "Experience", value: `${doctorData.experience} years` },
        ]);

        // Fetch doctor reviews
        await fetchDoctorReviews();
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [id]);

  const fetchDoctorReviews = async () => {
    try {
      const reviewsRes = await fetch(`http://localhost:4000/api/reviews/doctor/${id}?all=true`);
      if (!reviewsRes.ok) throw new Error("Failed to fetch reviews");
      const { data } = await reviewsRes.json();
      console.log('Fetched reviews:', data);
      
      // Sort reviews by date (newest first)
      const sortedReviews = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setReviews(sortedReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (comment.trim() && rating > 0) {
      const userId = localStorage.getItem('Userid');
      
      if (!userId) {
        setSubmitStatus({
          isSubmitting: false,
          message: 'You must be logged in to submit a review',
          isError: true
        });
        return;
      }
      
      const userName = userData?.name || 'Anonymous User';
      
      const reviewData = {
        doctorId: id,
        userId: userId,
        userName: userName,
        rating: rating,
        comment: comment
      };
      
      try {
        setSubmitStatus({
          isSubmitting: true,
          message: 'Submitting your review...',
          isError: false
        });
        
        const response = await fetch('http://localhost:4000/api/reviews/doctor/createreview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(reviewData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit review');
        }
        
        setComment('');
        setRating(0);
        
        // Refresh reviews after successful submission
        await fetchDoctorReviews();
        
        setSubmitStatus({
          isSubmitting: false,
          message: 'Review submitted successfully!',
          isError: false
        });
        
        setTimeout(() => {
          setSubmitStatus({
            isSubmitting: false,
            message: '',
            isError: false
          });
        }, 3000);
        
      } catch (err) {
        setSubmitStatus({
          isSubmitting: false,
          message: err.message,
          isError: true
        });
      }
    } else {
      setSubmitStatus({
        isSubmitting: false,
        message: 'Please provide both a rating and a comment',
        isError: true
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PatientNavbar pageTitle="Doctor Profile" />
        <div className="flex pt-16">
          <Sidebar role="patient" />
          <div className="flex-1 ml-64 p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <PatientNavbar pageTitle="Doctor Profile" />
        <div className="flex pt-16">
          <Sidebar role="patient" />
          <div className="flex-1 ml-64 p-8">
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed top-0 left-0 right-0 z-50">
        <PatientNavbar pageTitle="Doctor Profile" />
      </div>

      <div className="flex pt-16">
        <div className="fixed left-0 top-16 h-screen w-64 z-40">
          <Sidebar role="patient" />
        </div>

        <div className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto bg-gray-50">
            {/* Profile Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="flex items-center gap-6">
                <img
                  src={doctor?.image || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"}
                  alt={doctor?.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">Dr. {doctor?.name}</h1>
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{doctor?.degree}</p>
                  <p className="text-gray-600">{doctor?.address}</p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-full">
                      <stat.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Speciality and Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-3">Speciality</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {doctor?.specialist}
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-3">Available Time</h2>
                  <p className="text-gray-700">{doctor?.availableTime}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5" /> Email
                  </h2>
                  <p className="text-gray-700">{doctor?.email}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Phone className="w-5 h-5" /> Phone
                  </h2>
                  <p className="text-gray-700">{doctor?.phone}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Address
                  </h2>
                  <p className="text-gray-700">{doctor?.address}</p>
                </div>
              </div>
            </div>

            {/* Review Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Reviews & Comments</h2>
              
              {/* Add Review Form */}
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">
                    {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your review..."
                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={submitStatus.isSubmitting}
                    className={`bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 ${
                      submitStatus.isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    {submitStatus.isSubmitting ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {submitStatus.isSubmitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
                
                {submitStatus.message && (
                  <div className={`mt-3 text-sm ${submitStatus.isError ? 'text-red-500' : 'text-green-500'}`}>
                    {submitStatus.message}
                  </div>
                )}
              </form>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{review.userName || 'Anonymous'}</p>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to leave a review!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Doctorprofilenadreview;