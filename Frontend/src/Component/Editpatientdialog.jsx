import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

const   EditPatientDialog = ({ data, onClose, onSave }) => {
  const [editedUser, setEditedUser] = useState({ ...data });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in editedUser.personalinfo) {
        // Update the personalinfo field
        setEditedUser((prev) => ({
          ...prev,
          personalinfo: {
            ...prev.personalinfo,
            [name]: value,
          },
        }));
      } else {
        // Update fields outside of personalinfo
        setEditedUser((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
  };

  const handleSave = () => {
    onSave(editedUser);
    onClose();
  };

  return (
    <div className="min-h-screen inset-0 items-center absolute bg-gray-600 bg-opacity-30 backdrop-blur-[0.5px] p-6 flex justify-center">
      <div className="max-w-3xl h-[40rem] overflow-y-auto w-full bg-white p-6 rounded-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Edit Patient Profile</h1>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-6">
          <div>
            <label className="text-gray-500 text-sm">Full Name</label>
            <input type="text" name="name" value={editedUser.name} onChange={handleChange} className="border p-2 w-full rounded-md" />
          </div>
          <div>
            <label className="text-gray-500 text-sm">Patient ID</label>
            <input type="text" value={editedUser.patientId} disabled className="border p-2 w-full rounded-md bg-gray-100" />
          </div>
          {/* <div>
            <label className="text-gray-500 text-sm">Date of Birth</label>
            <input type="date" name="dobBS" value={editedUser.personalinfo?.dobBS || ''} onChange={handleChange} className="border p-2 w-full rounded-md" />
          </div> */}
          <div>
            <label className="text-gray-500 text-sm">Blood Group</label>
            <input type="text" name="bloodGroup" value={editedUser.personalinfo?.bloodGroup || ''} onChange={handleChange} className="border p-2 w-full rounded-md" />
          </div>
          <div>
            <label className="text-gray-500 text-sm">Phone</label>
            <input type="text" name="phone" value={editedUser.phone} onChange={handleChange} className="border p-2 w-full rounded-md" />
          </div>
          <div>
            <label className="text-gray-500 text-sm">Email</label>
            <input type="email" name="email" disabled value={editedUser.email} onChange={handleChange} className="border p-2 w-full rounded-md" />
          </div>
          <div className="col-span-2">
            <label className="text-gray-500 text-sm">Address</label>
            <input type="text" name="address" value={editedUser.personalinfo?.address || ''} onChange={handleChange} className="border p-2 w-full rounded-md" />
          </div>
          <div className="col-span-2">
            <label className="text-gray-500 text-sm">District</label>
            <input type="text" name="district" value={editedUser.personalinfo.district || ''} onChange={handleChange} className="border p-2 w-full rounded-md" />
          </div>
          <div className="col-span-2">
            <label className="text-gray-500 text-sm">Province</label>
            <input type="text" name="province" value={editedUser.personalinfo?.province || ''} onChange={handleChange} className="border p-2 w-full rounded-md" />
          </div>
          <div className="col-span-2">
            <label className="text-gray-500 text-sm">Emergency Contact</label>
            <input type="text" name="emergencyContact" value={editedUser.personalinfo.emergencyContact || ''} onChange={handleChange} className="border p-2 w-full rounded-md" />
          </div>
        </div>

        <div className="px-6 pb-6 border-t pt-4">
          <div className="flex items-center mb-4">
            <ArrowRight className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium">Medical Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-gray-500 text-sm">Allergies</label>
              <input type="text" name="allergies" value={editedUser.personalinfo.allergies || ''} onChange={handleChange} className="border p-2 w-full rounded-md" />
            </div>
            <div>
              <label className="text-gray-500 text-sm">Medical Conditions</label>
              <input type="text" name="medicalConditions" value={editedUser.personalinfo.medicalConditions || ''} onChange={handleChange} className="border p-2 w-full rounded-md" />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-md">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditPatientDialog;
