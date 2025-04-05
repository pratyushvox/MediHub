import React, { useState } from 'react';
import { X } from 'lucide-react';

const EditDoctorProfileDialog = ({ data, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState({ ...data });
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(editedUser);
    onclose();
  };

  return (
    <div className="min-h-screen inset-0 absolute bg-gray-600 bg-opacity-30 backdrop-blur-[0.5px] p-6 flex justify-center">
      <div className="max-w-3xl w-full bg-white p-6 rounded-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Doctor Profile</h1>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-gray-500 text-sm mb-1">Full Name</label>
            <input type="text" name="name" value={editedUser.name} onChange={handleChange} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1">Doctor ID</label>
            <input type="text" value={editedUser.doctorId
} disabled className="border p-2 w-full rounded bg-gray-100" />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1">Available Time</label>
            <input type="text" name="availableTime" value={editedUser.availableTime || ''} onChange={handleChange} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1">Experience</label>
            <input type="text" name="experience" value={editedUser.experience || ''} onChange={handleChange} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1">Phone</label>
            <input type="text" name="phone" value={editedUser.phone} onChange={handleChange} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1">Email</label>
            <input type="email" name="email" value={editedUser.email} onChange={handleChange} className="border p-2 w-full rounded" />
          </div>
          <div className="col-span-2">
            <label className="text-gray-500 text-sm mb-1">Address</label>
            <input type="text" name="address" value={editedUser.address || ''} onChange={handleChange} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1">Specialty</label>
            <input type="text" name="specialist" value={editedUser.specialist || ''} onChange={handleChange} className="border p-2 w-full rounded" />
          </div>
          <div>
            <label className="text-gray-500 text-sm mb-1">Degree</label>
            <input type="text" name="degree" value={editedUser.degree || ''} onChange={handleChange} className="border p-2 w-full rounded" />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-4">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Cancel</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditDoctorProfileDialog;
