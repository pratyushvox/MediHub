import mongoose from "mongoose";
import Doctor from "../../models/Doctor/Doctorsignupmodel.js";

export const getDoctorDetails = async (req, res) => {
  try {
    const { docid } = req.params;

    // Validate if ID is a proper MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(docid)) {
      return res.status(400).json({ message: "Invalid doctor ID format" });
    }

    const doctor = await Doctor.findById(docid).select("-password -doctorToken");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
