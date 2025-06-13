import Doctor from "../../models/Doctor/Doctorsignupmodel.js"; // Import the Doctor model

// Delete a doctor by ID
export const deleteDoctor = async (req, res) => {
  try {
    const { docid } = req.params;

    // Check if doctor exists
    const doctor = await Doctor.findById(docid);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Delete the doctor
    await Doctor.findByIdAndDelete(docid);

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
};
