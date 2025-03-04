import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaUserMd, FaUser, FaUserTie } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Loginbg from "../../Images/Loginbg.png";
import Button from "../../Component/Button";
import { toast } from "react-toastify";
import { baseUrl } from "../../Constant/Constant";
import Login from "../Userauthentication/Login";


const DoctorLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
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
        const res = await fetch(`${baseUrl}doctor/login`, {
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

        if (data && data.token) {
          localStorage.setItem("authToken", data.token);

          toast.success("Logged in successfully!");
          setFormData({ email: "", password: "" });

          navigate(`/doctor/dashboard`); // Update navigation path for Doctor's dashboard
        } else {
          throw new Error("Failed to log in. Please try again.");
        }
      } catch (error) {
        console.error("Login error:", error.message);
        toast.error("Failed to login. Please try again.");
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

  const handleRoleClick = (role) => {
    if (role === "patient") {
      navigate("/Login");  // Navigate to the Patient Login page
    } else if (role === "doctor") {
      navigate("/Doctor/login");  // Keep on Doctor Login page
    } else {
      navigate("/Admin/Login");  // Navigate to the Admin Login page
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Login Form Side */}
          <div className="w-1/2 p-10 h-full">
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-center text-[#3CB5AC]">
                  Welcome to <span className="text-[#0665A7]">MediHub</span>
                </h1>
                <h2 className="text-2xl ml-7 font-extrabold text-[#3CB5AC] mt-5">Doctor Login</h2>
                <p className="text-lg text-gray-600 text-center mt-6">
                  Login to manage your profile and appointments.
                </p>
                <p className="text-lg text-gray-600 text-center mt-6">
                  Are you?
                </p>
                <div className="flex justify-center space-x-6 mt-4">
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => handleRoleClick("doctor")}
                  >
                    <FaUserMd
                      className="text-4xl text-[#3CB5AC] hover:text-[#0665A7] hover:scale-110 transition duration-200"
                    />
                    <p className="text-sm text-gray-600">Doctor</p>
                  </div>
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => handleRoleClick("patient")}
                  >
                    <FaUser
                      className="text-4xl text-[#3CB5AC] hover:text-[#0665A7] hover:scale-110 transition duration-200"
                    />
                    <p className="text-sm text-gray-600">Patient</p>
                  </div>
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => handleRoleClick("admin")}
                  >
                    <FaUserTie
                      className="text-4xl text-[#2FA093] hover:text-[#0665A7] hover:scale-110 transition duration-200"
                    />
                    <p className="text-sm text-gray-600">Admin</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center space-y-6">
                <div className="h-[70px]">
                  <label className="block text-[#0665A7] font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3CB6AB]"
                    placeholder="name@drmedihubclinic.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="h-[70px]">
                  <label className="block text-[#0665A7] font-medium mb-1">Password</label>
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
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
            className="w-1/2 bg-cover bg-center h-[645px]"
            style={{ backgroundImage: `url(${Loginbg})` }}
          >
            <div className="h-full flex flex-col justify-end items-center p-6 bg-gradient-to-t from-black/60 via-black/40 to-transparent">
              <h1 className="text-4xl font-bold text-white mb-4">MediHub</h1>
              <p className="text-lg text-white">Where Care Comes First</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
