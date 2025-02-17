import User from "../../models/Usermodel/userModel.js";

export const updatePersonalInfo = async (req, res) => {
  try {
    const { userId } = req.params; // Get user ID from params
    const personalInfoData = req.body; // Get personal info from request body

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.personalinfo && Object.keys(user.personalinfo).length > 0) {
      return res.status(400).json({ message: "Personal info already provided" });
    }

    user.personalinfo = personalInfoData;
    await user.save();

    res.status(200).json({ message: "Personal info updated successfully" });
  } catch (error) {
    console.error("Update personal info error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
