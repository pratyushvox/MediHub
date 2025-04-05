import mongoose from 'mongoose';

// Define Doctor Schema
const doctorSchema = new mongoose.Schema({
  doctorId: {  // Add this new field
    type: String,
    unique: true,
    index: true
  },
  name: { type: String, required: true },
  availableTime: { type: String, required: true },
  specialist: { type: String, required: true },
  address: { type: String, required: true },
  experience: { type: Number, required: true },
  degree: { type: String, required: true },
  price: { type: Number, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  doctorToken: { type: String },
  bookedslots: [
    {
      date: { type: String, required: true },
      time: { type: String, required: true },
    },
  ],
  verified: { type: Boolean, default: false } // Add this if not present
});

// Add pre-save hook to generate doctorId
doctorSchema.pre('save', async function(next) {
  if (this.isNew && !this.doctorId) {
    let isUnique = false;
    let doctorId;
    
    while (!isUnique) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      doctorId = `DOC-${randomNum}`;
      
      const existingDoctor = await this.constructor.findOne({ doctorId });
      if (!existingDoctor) {
        isUnique = true;
      }
    }
    
    this.doctorId = doctorId;
  }
  next();
});

// Create a model for the Doctor schema
const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;