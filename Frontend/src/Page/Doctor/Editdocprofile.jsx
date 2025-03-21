import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { baseUrl } from '../../Constant/Constant';
import { toast } from "react-toastify";

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
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const doctorId = localStorage.getItem('doctorId');
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorData({ ...doctorData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      const doctorId = localStorage.getItem('doctorId');
      const response = await fetch(`${baseUrl}doctor/updatedetails/${doctorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="max-w-2xl w-full bg-white p-6 shadow-md rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Doctor Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        {success && <p className="text-green-500 text-center">{success}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" value={doctorData.name} onChange={handleChange} placeholder="Full Name" className="p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
            <input type="text" name="specialist" value={doctorData.specialist} onChange={handleChange} placeholder="Specialty" className="p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Time</label>
            <input type="text" name="availableTime" value={doctorData.availableTime} onChange={handleChange} placeholder="Available Time" className="p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
            <input type="text" name="experience" value={doctorData.experience} onChange={handleChange} placeholder="Experience" className="p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
            <input type="text" name="degree" value={doctorData.degree} onChange={handleChange} placeholder="Degree" className="p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" name="address" value={doctorData.address} onChange={handleChange} placeholder="Address" className="p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
            <input type="number" name="price" value={doctorData.price} onChange={handleChange} placeholder="Consultation Fee" className="p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="text" name="phone" value={doctorData.phone} onChange={handleChange} placeholder="Phone Number" className="p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={doctorData.email}
              readOnly // Make the field read-only
              placeholder="Email"
              className="p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
            />
          </div>
          <button type="submit" className="col-span-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors">
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditDocProfile;