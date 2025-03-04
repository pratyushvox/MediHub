import mongoose from 'mongoose';

// Define Doctor Schema
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  availableTime: { type: String, required: true },
  specialist: { type: String, required: true },
  address: { type: String, required: true },
  experience: { type: Number, required: true },
  degree: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Create a model for the Doctor schema
const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
