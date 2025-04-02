import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { baseUrl } from '../../Constant/Constant';

const VerifyPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Get parameters from URL
  const paymentId = searchParams.get('paymentId') || searchParams.get('pidx');
  const khaltiPidx = searchParams.get('pidx');

  const verifyPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${baseUrl}Payment/khalti/verify`, {
        paymentId: paymentId,
        pidx: khaltiPidx,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/payment/sucess?appointmentId=${response.data.appointmentId || response.data.appointment.id}`);
        }, 2000); // Redirect after 2 seconds
      } else {
        setError(response.data.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full text-center border-t-4 border-[#357BA6]">
        <h2 className="text-2xl font-semibold text-[#357BA6] mb-4">Verify Your Payment</h2>
        <p className="text-gray-600">Please verify your payment to proceed.</p>

        <div className="mt-4 bg-gray-50 p-4 rounded-lg w-full border-l-4 border-[#357BA6]">
          <p className="text-gray-700"><strong>Payment Reference:</strong> {paymentId}</p>
          {khaltiPidx && <p className="text-gray-700"><strong>Transaction ID:</strong> {khaltiPidx}</p>}
        </div>

        {error && (
          <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-lg">
            <p>{error}</p>
            <button 
              onClick={verifyPayment} 
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Retry Verification
            </button>
          </div>
        )}

        {success ? (
          <div className="mt-4 text-green-600 bg-green-100 p-3 rounded-lg">
            <p>Payment verified successfully! Redirecting...</p>
          </div>
        ) : (
          <button
            onClick={verifyPayment}
            disabled={loading}
            className={`mt-6 px-6 py-2 text-white font-semibold rounded-lg transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#357BA6] hover:bg-[#2C5D7A]'
            }`}
          >
            {loading ? 'Verifying...' : 'Verify Payment'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyPayment;
