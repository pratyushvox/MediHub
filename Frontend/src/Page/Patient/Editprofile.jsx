import React, { useState, useEffect } from "react";

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
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Check if the field is part of personalinfo
    if (name in formData.personalinfo) {
      setFormData({
        ...formData,
        personalinfo: {
          ...formData.personalinfo,
          [name]: value,
        },
      });
    } else {
      // For other fields that are not part of personalinfo
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (userId) {
        // Log the data to check the structure
        console.log("Updated Data:", formData);
  
        const updatedData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          // Flatten the personalinfo fields
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
        onClose(); // Close the modal after successful save
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[570px] border-t-4 border-[#0367A3]">
        <h2 className="text-lg font-bold mb-4 text-center text-[#0367A3]">Edit Patient Profile</h2>
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
      </div>
    </div>
  );
}

export default EditPatientProfile;
