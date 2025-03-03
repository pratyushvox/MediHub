import mongoose from "mongoose";

// Define the schema for the Admin
const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Create a model based on the schema
const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
