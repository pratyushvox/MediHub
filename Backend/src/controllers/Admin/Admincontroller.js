import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Admin from "../../models/Admin/Adminmodel.js"; // Import the Admin model

// Load environment variables
dotenv.config();

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in .env file");
}

// Create Admin (first time setup)
export const createAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin with the provided email and hashed password
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    // Save admin to the database
    await newAdmin.save();

    return res.status(201).json({
      message: "Admin created successfully",
      admin: { email: newAdmin.email },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin Login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
