import User from "../../models/Usermodel/userModel.js";

export const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json({ exists: true, message: "Email already registered" });
    } else {
      return res.status(200).json({ exists: false, message: "Email is available" });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ message: "Server error while checking email" });
  }
};
