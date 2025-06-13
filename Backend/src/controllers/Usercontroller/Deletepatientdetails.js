import mongoose from 'mongoose';
import User from "../../models/Usermodel/userModel.js";

export const deletePatient = async (req, res) => {
  try {
    let { userId } = req.params;
    
    // Trim the userId to remove any unwanted characters
    userId = userId.trim();
    console.log("Deleting user with ID:", userId);

    // Validate if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Check if user exists and is a patient (you might need to adjust this based on your User model)
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional: Add check if user is a patient
    // if (user.role !== 'patient') {
    //   return res.status(403).json({ message: "Only patients can be deleted" });
    // }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ message: "Server error" });
  }
};