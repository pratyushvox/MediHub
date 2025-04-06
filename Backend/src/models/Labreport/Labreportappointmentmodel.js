import mongoose from 'mongoose';

const testRequestSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  testType: {
    type: String,
    enum: ['X-ray', 'MRI', 'CT Scan', 'Ultrasound', 'Blood Test', 'ECG', 'Other'],
    required: true
  },
  bodyPart: {
    type: String,
    enum: ['Chest', 'Abdomen', 'Skull', 'Spine', 'Arm', 'Leg', 'Pelvis', 'Other'],
    required: function() {
      return ['X-ray', 'MRI', 'CT Scan'].includes(this.testType);
    }
  },
  referringDoctor: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['Routine', 'Urgent', 'STAT'],
    default: 'Routine'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Fone Pay'], // Updated to match your frontend
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String
  },
  consent: {
    type: Boolean,
    required: true,
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'Consent must be given'
    }
  },
  TestResult: {
    type: String,
    enum: ['Pending', 'In Progress', 'Done', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
testRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const TestRequest = mongoose.model('TestRequest', testRequestSchema);

export default TestRequest;