import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, User } from 'lucide-react';
import { baseUrl } from '../../Constant/Constant';
import { toast } from "react-toastify";
import axios from 'axios';

function EditDocProfile({ onClose }) {
  const [doctorData, setDoctorData] = useState({
    name: '',
    availableTime: '',
    specialist: '',
    address: '',
    experience: '',
    degree: '',
    price: '',
    phone: '',
    email: '',
    profilePic: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const doctorId = localStorage.getItem('doctorId');

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        if (!doctorId) {
          throw new Error('Doctor ID not found in localStorage');
        }

        const response = await fetch(`${baseUrl}doctor/${doctorId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch doctor data');
        }

        const data = await response.json();
        setDoctorData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorData({ ...doctorData, [name]: value });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await axios.post(
        `${baseUrl}doctor/upload-profile/${doctorId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.profilePic) {
        setDoctorData(prev => ({ ...prev, profilePic: response.data.profilePic }));
        toast.success('Profile picture updated successfully!');
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
    const names = doctorData.name.split(' ');
    let initials = '';
    if (names.length > 0) initials += names[0][0];
    if (names.length > 1) initials += names[names.length - 1][0];
    return initials || <User className="w-8 h-8" />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${baseUrl}doctor/updatedetails/${doctorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully!');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[570px] border-t-4 border-[#0367A3] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#0367A3]">Edit Doctor Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Picture Section - Matching the patient profile design */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            {isUploading ? (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            ) : doctorData.profilePic ? (
              <img
                src={doctorData.profilePic}
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
            {doctorData.profilePic ? 'Change photo' : 'Upload photo'}
          </button>
          {doctorData.profilePic && !isUploading && (
            <button
              onClick={() => setDoctorData(prev => ({ ...prev, profilePic: '' }))}
              className="mt-1 text-xs text-red-500 hover:text-red-700"
            >
              Remove photo
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={doctorData.name}
              onChange={handleChange}
              className="w-full border border-[#0367A3] p-2 rounded"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700">Specialty</label>
            <input
              type="text"
              name="specialist"
              value={doctorData.specialist}
              onChange={handleChange}
              className="w-full border border-[#0367A3] p-2 rounded"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700">Available Time</label>
            <input
              type="text"
              name="availableTime"
              value={doctorData.availableTime}
              onChange={handleChange}
              className="w-full border border-[#0367A3] p-2 rounded"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700">Experience (Years)</label>
            <input
              type="text"
              name="experience"
              value={doctorData.experience}
              onChange={handleChange}
              className="w-full border border-[#0367A3] p-2 rounded"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700">Degree</label>
            <input
              type="text"
              name="degree"
              value={doctorData.degree}
              onChange={handleChange}
              className="w-full border border-[#0367A3] p-2 rounded"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              name="address"
              value={doctorData.address}
              onChange={handleChange}
              className="w-full border border-[#0367A3] p-2 rounded"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700">Consultation Fee</label>
            <input
              type="number"
              name="price"
              value={doctorData.price}
              onChange={handleChange}
              className="w-full border border-[#0367A3] p-2 rounded"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={doctorData.phone}
              onChange={handleChange}
              className="w-full border border-[#0367A3] p-2 rounded"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={doctorData.email}
              readOnly
              className="w-full border p-2 rounded bg-gray-200 cursor-not-allowed"
            />
          </div>
          <div className="col-span-2 flex justify-end space-x-2 mt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-[#0367A3] text-white px-4 py-2 rounded hover:bg-[#035a8c] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditDocProfile;