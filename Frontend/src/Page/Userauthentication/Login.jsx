import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Loginbg from "../../Images/Loginbg.png";
import Button from "../../Component/Button";
import OtpVerification from "../../Component/OtpVerification";
import EmailVerificationPopup from "../../Component/EmailVerificationPopup"; // Import the new component
import { baseUrl } from "../../Constant/Constant";
import {toast} from "react-toastify";


const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [resetEmailError, setResetEmailError] = useState("");
  const [showEmailPopup, setShowEmailPopup] = useState(false); // New state for email popup

  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const res = await fetch(`${baseUrl}users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
  
        const data = await res.json();
  
        if (!data || !data.user || !data.user.id) {
          throw new Error("Invalid response from server");
        }
  
        const userId = data.user.id;
        const personalInfo = data.user.personalinfo; // Assuming backend returns this
        
        console.log("User Personal Info:", personalInfo);
  
        toast.success("Logged in successfully!");
        setFormData({ email: "", password: "" });
  
        // Check if personalinfo is null and navigate accordingly
        if (!personalInfo) {
          navigate(`/personalinfo/${userId}`);
        } else {
          navigate(`/Pdashboard/${userId}`);
        }
      } catch (error) {
        console.error("Fetch error:", error.message);
        toast.error("Failed to login. Please try again.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleOtpSuccess = () => {
    alert("OTP verification successful. You can now reset your password.");
    // Redirect to password reset page or perform relevant action
  };

  const handleOtpFailure = () => {
    alert("Failed to verify OTP. Please try again.");
  };

  const handleForgotPasswordClick = () => {
    setShowEmailPopup(true); // Show the email verification popup
  };

  const handleEmailSubmit = (email) => {
    alert(`Email submitted: ${email}`);
    setShowEmailPopup(false); // Close the popup after submission
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Login Form Side */}
          <div className="w-1/2 p-10 h-[500px]">
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-center text-[#3CB5AC]">
                  Welcome to <span className="text-[#0665A7]">MediHub</span>
                </h1>
                <p className="text-lg text-gray-600 text-center mt-6">
                  Login to your account and get started.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center space-y-6">
                <div className="h-[70px]">
                  <label className="block text-[#0665A7] font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CB6AB]"
                    placeholder="example@gmail.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                  {resetEmailError && (
                    <p className="text-red-500 text-sm mt-1">{resetEmailError}</p>
                  )}
                </div>

                <div className="h-[70px]">
                  <label className="block text-[#0665A7] font-medium mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CB6AB]"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPasswordClick}
                    className="text-[#0665A7] hover:text-[#3CB5AC] text-sm font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  text="Login"
                  type="submit"
                  className="w-full bg-[#2FA093] p-2 rounded-md text-white font-semibold hover:bg-[#05527E] transition"
                />
              </form>
            </div>
          </div>

          {/* Image Side */}
          <div
            className="w-1/2 bg-cover bg-center h-[500px]"
            style={{ backgroundImage: `url(${Loginbg})` }}
          >
            <div className="h-full flex flex-col justify-end items-center p-6 bg-gradient-to-t from-black/60 via-black/40 to-transparent">
              <h1 className="text-4xl font-bold text-white mb-4">MediHub</h1>
              <p className="text-lg text-white">Where Care Comes First</p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Popup */}
      {showOtpPopup && (
        <OtpVerification
          email={formData.email}
          onClose={() => setShowOtpPopup(false)}
          onSuccess={handleOtpSuccess}
          onFailure={handleOtpFailure}
        />
      )}

      {/* Email Verification Popup */}
      {showEmailPopup && (
        <EmailVerificationPopup
          onClose={() => setShowEmailPopup(false)}
          onSubmit={handleEmailSubmit}
        />
      )}
    </div>
  );
};

export default Login;