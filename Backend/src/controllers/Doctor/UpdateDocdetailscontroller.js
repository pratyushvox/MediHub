import Doctor from "../../models/Doctor/Doctorsignupmodel.js";

const updateDocDetails = async (req, res) => {
  try {
    const { docid } = req.params;
    const updateData = req.body;

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      docid,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ message: "Doctor details updated successfully", updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor details", error: error.message });
  }
};

export default updateDocDetails;
