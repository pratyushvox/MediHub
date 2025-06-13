import User from "../../models/Usermodel/userModel.js";

export const updateUserDetailsController = async (req, res) => {
  const { userId } = req.params;
  const {
    name,
    phone,
    address,
    district,
    province,
    bloodGroup,
    allergies,
    medicalConditions,
    emergencyContact,
    majorSurgery
  } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Ensure personalinfo exists before updating
    if (!user.personalinfo) {
      user.personalinfo = {};
    }

    // Use Mongoose set to update nested fields
    user.set({
      "personalinfo.address": address || user.personalinfo.address,
      "personalinfo.district": district || user.personalinfo.district,
      "personalinfo.province": province || user.personalinfo.province,
      "personalinfo.bloodGroup": bloodGroup || user.personalinfo.bloodGroup,
      "personalinfo.allergies": allergies || user.personalinfo.allergies,
      "personalinfo.medicalConditions": medicalConditions || user.personalinfo.medicalConditions,
      "personalinfo.emergencyContact": emergencyContact || user.personalinfo.emergencyContact,
      "personalinfo.majorSurgery": majorSurgery || user.personalinfo.majorSurgery
    });

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: "User details updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
