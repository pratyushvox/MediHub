import React, { useState } from "react";
import { FaEye, FaEyeSlash , FaGoogle } from "react-icons/fa";
import doctor from "../../Images/signupbg.png";
import Button from "../../Component/Button.jsx";
import OtpVerification from "../../Component/OtpVerification.jsx";
import { baseUrl } from "../../Constant/Constant.js";
import { toast } from "react-toastify";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@gmail\.com$/i.test(formData.email)) {
      newErrors.email = "Enter a valid Gmail address.";
    }
    if (!formData.phone) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
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
        const response = await fetch(`${baseUrl}users/request-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData), // Sending all form data
        });

        const data = await response.json();

        if (response.ok) {
          setShowOtpPopup(true);
          setSubmitError("");
        } else {
          setSubmitError(data.message || "Failed to send OTP. Please try again.");
        }
      } catch (error) {
        setSubmitError("An error occurred. Please try again later.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Side: Image */}
        <div
          className="w-1/2 bg-cover bg-center h-[600px]"
          style={{
            backgroundImage: `url(${doctor})`,
          }}
        >
          <div className="h-full flex flex-col justify-end items-center p-6 bg-gradient-to-t from-black/60 via-black/40 to-transparent">
            <h1 className="text-4xl font-bold text-white mb-4">MediHub</h1>
            <p className="text-lg text-white">Your most trusted clinic</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-1/2 p-8 h-[600px]">
          <div className="flex flex-col h-full">
            <h2 className="text-3xl font-bold text-center text-[#3CB5AC] mb-6">
              Create An Account
            </h2>
            {submitError && (
              <p className="text-red-500 text-sm text-center mb-4">{submitError}</p>
            )}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
              <div className="h-[70px]">
                <label className="block text-[#0665A7] font-semibold">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CB6AB]"
                />
                {errors.name && <p className="text-red-500 text-sm absolute">{errors.name}</p>}
              </div>

              <div className="h-[70px]">
                <label className="block text-[#0665A7] font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CB6AB]"
                  placeholder="example@gmail.com"
                />
                {errors.email && <p className="text-red-500 text-sm absolute">{errors.email}</p>}
              </div>

              <div className="h-[70px]">
                <label className="block text-[#0665A7] font-semibold">Phone no</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CB6AB]"
                />
                {errors.phone && <p className="text-red-500 text-sm absolute">{errors.phone}</p>}
              </div>

              <div className="h-[70px] relative">
                <label className="block text-[#0665A7] font-semibold">Password</label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CB6AB]"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute top-[32px] right-3 flex items-center text-gray-500"
                >
                  {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && <p className="text-red-500 text-sm absolute">{errors.password}</p>}
              </div>

              <div className="mt-auto pt-4">
                <Button
                  text="Signup"
                  type="submit"
                  className="w-full bg-[#2FA093] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#05527E] transition mt-3 "
                />
      <Button
  text={
    <span className="flex items-center justify-center gap-2">
      <FaGoogle className="text-lg" /> Sign up with Google
    </span>
  }
  type="button"
  className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition mt-3 shadow-sm"
  onClick={() => window.location.href = `${baseUrl}auth/google`}
/>


              </div>
            </form>
          </div>
        </div>
      </div>

      {showOtpPopup && (
        <OtpVerification 
          email={formData.email}
          onClose={() => setShowOtpPopup(false)}
        />
      )}
    </div>
  );
};

export default SignUp;