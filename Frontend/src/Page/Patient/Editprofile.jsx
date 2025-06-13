import React, { useState, useEffect, useRef } from "react";
import { Upload, User, X, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditPatientProfile({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    personalinfo: {
      address: "",
      district: "",
      province: "",
      bloodGroup: "",
      allergies: "",
      medicalConditions: "",
      emergencyContact: "",
      majorSurgery: "",
    },
  });
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("personal"); // "personal" or "password"
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const userId = localStorage.getItem("Userid");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (userId) {
          const response = await fetch(`http://localhost:4000/api/users/${userId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();
          setFormData(data);
          // Set profile image if available
          if (data.profilePic) {
            setProfileImage(data.profilePic);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.personalinfo) {
      setFormData({
        ...formData,
        personalinfo: {
          ...formData.personalinfo,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    // Clear error when user starts typing again
    setPasswordError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `http://localhost:4000/api/users/upload-profile/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.profilePic) {
        setProfileImage(response.data.profilePic);
        toast.success("Profile picture updated successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const getInitials = () => {
    const names = formData.name.split(' ');
    let initials = '';
    if (names.length > 0) initials += names[0][0];
    if (names.length > 1) initials += names[names.length - 1][0];
    return initials || <User className="w-8 h-8" />;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (userId) {
        const updatedData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          profilePic: profileImage,
          address: formData.personalinfo.address,
          district: formData.personalinfo.district,
          province: formData.personalinfo.province,
          bloodGroup: formData.personalinfo.bloodGroup,
          allergies: formData.personalinfo.allergies,
          medicalConditions: formData.personalinfo.medicalConditions,
          emergencyContact: formData.personalinfo.emergencyContact,
          majorSurgery: formData.personalinfo.majorSurgery,
        };

        const response = await fetch(`http://localhost:4000/api/users/update-user-details/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
          throw new Error("Failed to update user data");
        }

        const updatedResponse = await response.json();
        console.log("Updated response:", updatedResponse);
        toast.success("Profile updated successfully");
        onClose();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password should be at least 6 characters");
      toast.error("Password should be at least 6 characters");
      return;
    }

    // Additional validation based on your backend requirements
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      setPasswordError("Password must include uppercase, lowercase, and number");
      toast.error("Password must include uppercase, lowercase, and number");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:4000/api/users/change-password/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data.message || "Failed to update password");
        toast.error(data.message || "Failed to update password");
        return;
      }

      // Reset form and show success
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordError("");
      toast.success("Password updated successfully");
      setActiveTab("personal");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("An error occurred while updating password");
      toast.error("An error occurred while updating password");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[570px] border-t-4 border-[#0367A3] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#0367A3]">Edit Patient Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            {isUploading ? (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            ) : profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-2 border-gray-200">
                <span className="text-2xl font-semibold text-blue-600">
                  {getInitials()}
                </span>
              </div>
            )}
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full border shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
              title="Change photo"
            >
              <Upload className="w-4 h-4 text-gray-600" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />
          </div>
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {profileImage ? 'Change photo' : 'Upload photo'}
          </button>
          {profileImage && !isUploading && (
            <button
              onClick={() => setProfileImage(null)}
              className="mt-1 text-xs text-red-500 hover:text-red-700"
            >
              Remove photo
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "personal"
                ? "text-[#0367A3] border-b-2 border-[#0367A3]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Details
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "password"
                ? "text-[#0367A3] border-b-2 border-[#0367A3]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </button>
        </div>

        {/* Personal Details Form */}
        {activeTab === "personal" && (
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-[#0367A3] p-2 rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                className="w-full border p-2 rounded bg-gray-200 cursor-not-allowed"
                readOnly
              />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-[#0367A3] p-2 rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.personalinfo.address}
                onChange={handleChange}
                className="w-full border border-[#0367A3] p-2 rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">District</label>
              <input
                type="text"
                name="district"
                value={formData.personalinfo.district}
                onChange={handleChange}
                className="w-full border border-[#0367A3] p-2 rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Province</label>
              <input
                type="text"
                name="province"
                value={formData.personalinfo.province}
                onChange={handleChange}
                className="w-full border border-[#0367A3] p-2 rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Blood Group</label>
              <input
                type="text"
                name="bloodGroup"
                value={formData.personalinfo.bloodGroup}
                onChange={handleChange}
                className="w-full border border-[#0367A3] p-2 rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Allergies</label>
              <input
                type="text"
                name="allergies"
                value={formData.personalinfo.allergies}
                onChange={handleChange}
                className="w-full border border-[#0367A3] p-2 rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Medical Conditions</label>
              <input
                type="text"
                name="medicalConditions"
                value={formData.personalinfo.medicalConditions}
                onChange={handleChange}
                className="w-full border border-[#0367A3] p-2 rounded"
              />
            </div>
            <div className="col-span-1">
              <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                value={formData.personalinfo.emergencyContact}
                onChange={handleChange}
                className="w-full border border-[#0367A3] p-2 rounded"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700">Major Surgery</label>
              <input
                type="text"
                name="majorSurgery"
                value={formData.personalinfo.majorSurgery}
                onChange={handleChange}
                className="w-full border border-[#0367A3] p-2 rounded"
              />
            </div>
            <div className="col-span-2 flex justify-end space-x-2 mt-4">
              <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
              <button type="submit" className="bg-[#0367A3] text-white px-4 py-2 rounded">
                Save
              </button>
            </div>
          </form>
        )}

        {/* Password Change Form */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.oldPassword ? "text" : "password"}
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-[#0367A3] p-2 rounded mt-1 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("oldPassword")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.oldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.newPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-[#0367A3] p-2 rounded mt-1 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.newPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters with uppercase, lowercase, and number
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full border border-[#0367A3] p-2 rounded mt-1 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {passwordError && (
              <div className="text-red-500 text-sm">{passwordError}</div>
            )}
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                type="button" 
                onClick={() => {
                  setActiveTab("personal");
                  setPasswordError("");
                }} 
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Back
              </button>
              <button type="submit" className="bg-[#0367A3] text-white px-4 py-2 rounded">
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EditPatientProfile;