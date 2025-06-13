import mongoose from 'mongoose';
import User from "../../models/Usermodel/userModel.js"; // Use ES6 import

export const getUserDetails = async (req, res) => {
  try {
    let { userId } = req.params;
    
    // Trim the userId to remove any unwanted characters like newlines
    userId = userId.trim();
    console.log("userid",userId)

    // Validate if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Fetch the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the full user details
    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
};
