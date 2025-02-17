import React, { useState } from 'react';
import ForgetpassOtpVerification from './ForgetpassOTPVerification';
import {baseUrl} from "../Constant/Constant";

const EmailVerificationPopup = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateEmail = (email) => {
    return /^[\w-.]+@gmail\.com$/i.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid Gmail address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}users/forgot-pass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Verification code sent successfully!');
        // Short delay to show success message before showing OTP popup
        setTimeout(() => {
          setShowOtpPopup(true);
        }, 1000);
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSuccess = () => {
    setShowOtpPopup(false);
    onClose();
  };

  return (
    <>
      {!showOtpPopup ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-[#3CB5AC] mb-6 text-center">
              Forgot Password
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Enter your email address to receive a verification code
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#0665A7] font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CB6AB]"
                  placeholder="example@gmail.com"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-[#2FA093] text-white rounded-lg hover:bg-[#05527E] transition disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Code'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <ForgetpassOtpVerification
          email={email} // Pass the email as a prop
          onClose={onClose}
          onSuccess={handleOtpSuccess}
        />
      )}
    </>
  );
};

export default EmailVerificationPopup;