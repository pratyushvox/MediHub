import React, { useState } from "react";
import personalinfo from "../../Images/personalinfobg.png";
import Button from "../../Component/Button";
import { useNavigate, useParams } from "react-router-dom";
import { baseUrl } from "../../Constant/Constant";

const FormPage = () => {

  const { id } = useParams();
  const userId = id ;
  console.log("userId",userId); 

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    district: "",
    province: "",
    ward: "",
    address: "",
    gender: "",
    age: "",
    dobAD: "",
    dobBS: "",
    medicalConditions: "",
    bloodGroup: "",
    phoneNumber: "",
    emergencyContact: "",
    majorSurgery: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};

    // Required Fields Validation
    if (!formData.district) newErrors.district = "District is required.";
    if (!formData.province) newErrors.province = "Province is required.";
    if (!formData.dobAD) newErrors.dobAD = "Date of Birth (AD) is required.";
    if (!formData.dobBS) newErrors.dobBS = "Date of Birth (BS) is required.";

    // Age Validation
    if (formData.age && (isNaN(formData.age) || formData.age <= 0)) {
      newErrors.age = "Age must be a positive number.";
    }

    // Phone Number Validation
    const phonePattern = /^[0-9]{10}$/;
    if (formData.phoneNumber && !phonePattern.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits.";
    }

    // Emergency Contact Validation
    if (
      formData.emergencyContact &&
      !phonePattern.test(formData.emergencyContact)
    ) {
      newErrors.emergencyContact = "Emergency contact must be 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      const updatedData = {
        ...formData,
        medicalConditions: formData.medicalConditions.trim() === "" ? "None" : formData.medicalConditions,
        majorSurgery: formData.majorSurgery.trim() === "" ? "None" : formData.majorSurgery,
      };
  
      try {
        const response = await fetch(`${baseUrl}users/update-personal-info/${userId}`, {
          method: "PUT", // Use "POST" if creating new data
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });
  
        if (!response.ok) {
          throw new Error("Failed to update personal info");
        }
        if(response.status === 200){
          navigate("/dashboard");
        }
  
        const data = await response.json();
        console.log("Update successful:", data);
      } catch (error) {
        console.error("Error updating personal info:", error);
      }
    }
  };
  

  const districts = [
    "Achham",
    "Arghakhanchi",
    "Baglung",
    "Baitadi",
    "Bajhang",
    "Bajura",
    "Banke",
    "Bara",
    "Bardiya",
    "Bhaktapur",
    "Bhojpur",
    "Chitwan",
    "Dadeldhura",
    "Dailekh",
    "Dang",
    "Darchula",
    "Dhading",
    "Dhankuta",
    "Dhanusha",
    "Dolakha",
    "Dolpa",
    "Doti",
    "Gorkha",
    "Gulmi",
    "Humla",
    "Ilam",
    "Jajarkot",
    "Jhapa",
    "Jumla",
    "Kailali",
    "Kalikot",
    "Kanchanpur",
    "Kapilvastu",
    "Kaski",
    "Kathmandu",
    "Kavrepalanchok",
    "Khotang",
    "Lalitpur",
    "Lamjung",
    "Mahottari",
    "Makwanpur",
    "Manang",
    "Morang",
    "Mugu",
    "Mustang",
    "Myagdi",
    "Nawalpur",
    "Nuwakot",
    "Okhaldhunga",
    "Palpa",
    "Panchthar",
    "Parbat",
    "Parsa",
    "Pyuthan",
    "Ramechhap",
    "Rasuwa",
    "Rautahat",
    "Rolpa",
    "Rukum (Eastern)",
    "Rukum (Western)",
    "Rupandehi",
    "Salyan",
    "Sankhuwasabha",
    "Saptari",
    "Sarlahi",
    "Sindhuli",
    "Sindhupalchok",
    "Siraha",
    "Solukhumbu",
    "Sunsari",
    "Surkhet",
    "Syangja",
    "Tanahun",
    "Taplejung",
    "Terhathum",
    "Udayapur",
  ];

  const provinces = [
    "Province No. 1",
    "Province No. 2",
    "Province No. 3",
    "Province No. 4",
    "Province No. 5",
    "Province No. 6",
    "Province No. 7",
  ];
  const gender = [
    "Male",
    "Female",
    "Others"
  ]

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${personalinfo})` }}
    >
      <div className="bg-white bg-opacity-80 p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-[#0367A4] mb-4">User Information</h2>

        <form onSubmit={handleSubmit}>
          {/* Address Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select District</option>
              {districts.map((district, index) => (
                <option key={index} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {errors.district && <p className="text-red-500 text-xs">{errors.district}</p>}

            <select
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Province</option>
              {provinces.map((province, index) => (
                <option key={index} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.province && <p className="text-red-500 text-xs">{errors.province}</p>}

            <input
              type="text"
              name="ward"
              placeholder="Ward"
              value={formData.ward}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Medical Information Section */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            
          <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Gender</option>
              {gender.map((gender, index) => (
                <option key={index} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
            {errors.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
            {errors.age && <p className="text-red-500 text-xs">{errors.age}</p>}

            <input
              type="date"
              name="dobAD"
              placeholder="Date of Birth (AD) *"
              value={formData.dobAD}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />
            {errors.dobAD && <p className="text-red-500 text-xs">{errors.dobAD}</p>}

            <input
              type="text"
              name="dobBS"
              placeholder="Date of Birth (BS) *"
              value={formData.dobBS}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />
            {errors.dobBS && <p className="text-red-500 text-xs">{errors.dobBS}</p>}

            <textarea
              name="medicalConditions"
              placeholder="Medical Conditions (e.g., Diabetes, Allergy, High Pressure). If none, leave empty."
              value={formData.medicalConditions}
              onChange={handleChange}
              className="border p-2 rounded w-full h-24"
            />
            <textarea
              name="majorSurgery"
              placeholder="Any major surgery or past serious medical condition? If none, leave empty."
              value={formData.majorSurgery}
              onChange={handleChange}
              className="border p-2 rounded w-full h-24"
            />
          </div>

          {/* Submit Button */}
          <Button
  text="Continue →"
  onClick={handleSubmit}
  className="bg-[#0367A4] text-white py-2 px-4 rounded w-full hover:bg-[#3CB6AB] transition "
/>
        </form>
      </div>
    </div>
  );
};

export default FormPage;
