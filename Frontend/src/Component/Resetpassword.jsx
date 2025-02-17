import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Button from './Button';
import { baseUrl } from '../Constant/Constant';
import { toast } from 'react-toastify';

const ResetPassword = ({ onClose, email, otp }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    console.log("Validating password:", password);
  
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    const isLengthValid = password.length >= 8;
  
    console.log("Validation Results:", {
      hasLowercase,
      hasUppercase,
      hasDigit,
      hasSpecialChar,
      isLengthValid,
    });
  
    const isValid = regex.test(password);
    console.log("Regex Test Result:", isValid);
  
    return isValid;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()  // Remove extra spaces
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const newPassword = formData.newPassword.trim();
    const confirmPassword = formData.confirmPassword.trim();

    console.log("New Password:", newPassword);
    console.log("Confirm Password:", confirmPassword);

    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        email, // Use the email prop
        otp, // Use the OTP prop
        newPassword,
        confirmPassword,
      };

      console.log('Sending payload:', payload);

      const response = await fetch(`${baseUrl}users/reset-pass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        toast.success('Password updated successfully! Please login with your new password.');
        onClose();
        navigate('/login');
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('API Error:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-[#3DB5AC] mb-6 text-center">
          Reset Password
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#0367A5] font-medium mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DB5AC]"
                placeholder="Enter new password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#0367A5] font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3DB5AC]"
                placeholder="Confirm new password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex justify-between gap-4 pt-4">
            <Button
              text="Cancel"
              onClick={onClose}
              className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            />
            <Button
              text={isLoading ? 'Resetting...' : 'Reset Password'}
              type="submit"
              className={`p-2 text-[#0366A4] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={isLoading ? undefined : handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
