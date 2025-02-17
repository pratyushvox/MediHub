import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../Constant/Constant';

const OtpVerification = ({ email, onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}users/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: otpString,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Verification successful! Please log in to continue.');
        onClose();
        navigate('/login'); // Redirect to login page
      } else {
        setError(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (isResending) return;

    setIsResending(true);
    try {
      const response = await fetch(`${baseUrl}api/users/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('A new OTP has been sent to your email.');
        setError('');
        setTimer(600); // Reset timer to 10 minutes
        setOtp(['', '', '', '', '', '']); // Clear OTP fields
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while resending OTP.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-[#3CB5AC] mb-6">
          Verify Your Email
        </h2>
        <p className="text-center text-gray-600 mb-6">
          We've sent a verification code to<br />
          <span className="font-semibold">{email}</span>
        </p>

        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              name={`otp-${index}`}
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center border-2 rounded-lg focus:border-[#3CB5AC] focus:outline-none text-lg font-bold"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleVerify}
            className="w-full bg-[#2FA093] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#05527E] transition"
          >
            Verify
          </button>

          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Time remaining: {formatTime(timer)}
            </p>
            <button
              onClick={handleResendOTP}
              disabled={timer > 0 || isResending}
              className={`text-[#3CB5AC] hover:underline ${
                (timer > 0 || isResending) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isResending ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
