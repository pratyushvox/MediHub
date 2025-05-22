import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from '../../Constant/Constant';
import Sidebar from '../../Component/Sidebar';
import PatientNavbar from '../../Component/PatientNavbar';

const VerifyPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Get and clean parameters from URL
  const rawPaymentId = searchParams.get('paymentId') || searchParams.get('pidx');
  const paymentId = rawPaymentId ? rawPaymentId.split('?')[0].split('/')[0] : null;
  const khaltiPidx = searchParams.get('pidx');

  const verifyPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      setPaymentStatus(null);

      const requestData = {
        ...(paymentId && { paymentId }),
        ...(khaltiPidx && { pidx: khaltiPidx }),
      };

      if (!requestData.paymentId && !requestData.pidx) {
        throw new Error('No payment identifier found');
      }

      const response = await axios.post(`${baseUrl}Payment/khalti/verify`, requestData);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/payment/success?appointmentId=${response.data.appointmentId || (response.data.appointment?.id || '')}`);
        }, 2000);
      } else {
        // Handle specific payment status from Khalti
        if (response.data.details?.status) {
          setPaymentStatus(response.data.details.status);
        }
        setError(response.data.message || 'Verification failed');
      }
    } catch (err) {
      if (err.response?.data?.details?.status) {
        setPaymentStatus(err.response.data.details.status);
      }
      setError(err.response?.data?.message || 
               err.response?.data?.error || 
               err.message || 
               'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = () => {
    navigate('/Patient/BookAppointment'); // Navigate back to payment page
  };

  const handleCancelPayment = () => {
    navigate('/patient/viewappointments'); // Navigate to appointments page
  };

  return (
    <div className="flex">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 z-40">
        <Sidebar role="patient" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full bg-gray-100 min-h-screen ml-64 mt-10">
        {/* Fixed Navbar */}
        <div className="fixed top-0 left-64 right-0 z-30">
          <PatientNavbar pageTitle="Payment Verification" />
        </div>
    
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
          <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full text-center border-t-4 border-[#357BA6]">
            <h2 className="text-2xl font-semibold text-[#357BA6] mb-4">
              {paymentStatus === 'User canceled' ? 'Payment Canceled' : 'Verify Your Payment'}
            </h2>

            {paymentStatus === 'User canceled' ? (
              <>
                <div className="mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-gray-700 mt-4">
                    You canceled the payment process. Your appointment has not been booked.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <button
                      onClick={handleRetryPayment}
                      className="px-4 py-2 bg-[#357BA6] text-white rounded-lg hover:bg-[#2C5D7A] transition-colors"
                    >
                      Book Again
                    </button>
                    <button
                      onClick={handleCancelPayment}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Go to Appointments
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">Please verify your payment to complete your appointment booking.</p>

                <div className="mt-4 bg-gray-50 p-4 rounded-lg w-full border-l-4 border-[#357BA6]">
                  {paymentId && (
                    <p className="text-gray-700 mb-2">
                      <strong>Payment Reference:</strong> {paymentId}
                    </p>
                  )}
                  {khaltiPidx && (
                    <p className="text-gray-700">
                      <strong>Transaction ID:</strong> {khaltiPidx}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="mt-6 text-red-600 bg-red-100 p-4 rounded-lg">
                    <p className="font-medium">{error}</p>
                    {paymentStatus && (
                      <p className="mt-2 text-sm">Status: {paymentStatus}</p>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button 
                        onClick={verifyPayment} 
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        disabled={loading}
                      >
                        {loading ? 'Retrying...' : 'Retry Verification'}
                      </button>
                      <button
                        onClick={handleCancelPayment}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {success ? (
                  <div className="mt-6 text-green-600 bg-green-100 p-4 rounded-lg">
                    <p className="font-medium">Payment verified successfully! Redirecting...</p>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                ) : (
                  !error && (
                    <button
                      onClick={verifyPayment}
                      disabled={loading}
                      className={`mt-6 px-6 py-3 text-white font-semibold rounded-lg transition-all ${
                        loading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-[#357BA6] hover:bg-[#2C5D7A] hover:shadow-md'
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : (
                        'Verify Payment'
                      )}
                    </button>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPayment;