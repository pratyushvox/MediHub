import { useState } from "react";
import { baseUrl } from "../../Constant/Constant.js";
import { toast } from "react-toastify";

export default function DoctorSignup({ closeModal, addDoctorToList }) {
  const [doctor, setDoctor] = useState({
    name: "",
    availableTime: "",
    specialist: "",
    address: "",
    experience: "",
    degree: "",
    phone: "",
    email: "",
    password: "",
  });

  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specialties = [
    { label: "Oral Surgeon", value: "oral_surgeon" },
    { label: "Pediatric Dentistry", value: "pediatric_dentistry" },
    { label: "General Physician", value: "general_physician" },
  ];

  const emailRegex = /^[a-zA-Z]+@drmedihubclinic\.com$/;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmailError(emailRegex.test(value) ? "" : "Email must be in format: name@drmedihubclinic.com");
    }
    setDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
  
    if (emailError || Object.values(doctor).some((field) => field.trim() === "")) {
      setFormError("Please fill out all fields correctly.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await fetch(`${baseUrl}doctor/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctor),
      });
  
      const data = await response.json();
  
      // Log the response data for debugging
      console.log("Response Status:", response.status); 
      console.log("Response OK:", response.ok); 
      console.log("Doctor signup response:", data);
  
      if (response.ok) {
        toast.success("Doctor added successfully!", { position: "top-right" });
        addDoctorToList(data); // Update doctor list instantly
  
        setDoctor({
          name: "", availableTime: "", specialist: "", address: "",
          experience: "", degree: "", phone: "", email: "", password: ""
        });
  
        setTimeout(closeModal, 2000);
      } else {
        console.error("Signup failed:", data.message);
        setFormError(data.message || "Signup failed. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setFormError(`Something went wrong: ${error.message || "Please try again."}`);
    }
  
    setIsSubmitting(false);
  };
  
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white max-w-2xl mx-auto p-8 border rounded shadow-lg relative">
        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-600 hover:text-gray-900">&times;</button>
        <h2 className="text-xl font-semibold text-center mb-6">Doctor Signup</h2>
        {formError && <div className="text-red-500 text-center mb-4">{formError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input className="border p-3 rounded" name="name" value={doctor.name} onChange={handleChange} placeholder="Full Name" />
            <input className="border p-3 rounded" name="availableTime" value={doctor.availableTime} onChange={handleChange} placeholder="Available Time (e.g., 9 AM - 5 PM)" />
            <select className="border p-3 rounded" name="specialist" value={doctor.specialist} onChange={handleChange}>
              <option value="">Select Specialist</option>
              {specialties.map((spec) => <option key={spec.value} value={spec.value}>{spec.label}</option>)}
            </select>
            <input className="border p-3 rounded" name="address" value={doctor.address} onChange={handleChange} placeholder="Address" />
            <input className="border p-3 rounded" name="experience" value={doctor.experience} onChange={handleChange} placeholder="Years of Experience" type="number" />
            <input className="border p-3 rounded" name="degree" value={doctor.degree} onChange={handleChange} placeholder="Degree" />
            <input className="border p-3 rounded" name="phone" value={doctor.phone} onChange={handleChange} placeholder="Phone Number" type="tel" />
            <input className="border p-3 rounded" name="email" value={doctor.email} onChange={handleChange} placeholder="name@drmedihubclinic.com" type="email" />
            {emailError && <span className="text-red-500 text-sm">{emailError}</span>}
            <input className="border p-3 rounded" name="password" value={doctor.password} onChange={handleChange} placeholder="Password" type="password" />
            <div className="col-span-2 flex justify-end gap-4 mt-6">
              <button onClick={closeModal} className="border px-6 py-3 rounded" type="button">Cancel</button>
              <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 cursor-pointer" disabled={isSubmitting}>
                {isSubmitting ? "Adding doctor..." : "Add Doctor"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
