import User from "../../models/Usermodel/userModel.js";
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, verified: true });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    await user.updateLastLogin();

    let message = "Login successful";
    let requiresPersonalInfo = false;

    if (!user.personalinfo) {
      message += ". Please complete your personal info.";
      requiresPersonalInfo = true;
    }

    console.log("User personalinfo:", user.personalinfo);

    res.status(200).json({
      message,
      requiresPersonalInfo,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        personalinfo: user.personalinfo || null, // Make sure frontend gets this
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
