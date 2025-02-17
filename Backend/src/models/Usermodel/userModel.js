import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const personalInfoSchema = new mongoose.Schema({
  district: String,
  province: String,
  ward: String,
  address: String,
  gender: String,
  age: Number,
  dobAD: String,
  dobBS: String,
  medicalConditions: { type: String, default: "None" },
  bloodGroup: String,
  phoneNumber: String,
  emergencyContact: String,
  majorSurgery: { type: String, default: "None" }
});


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,  // This creates an index automatically
      lowercase: true,
      trim: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        'Please enter a valid email address'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long']
    },
    verified: {
      type: Boolean,
      default: false
    },
    otp: {
      type: String,
      select: false // OTP won't be included in query results by default
    },
    otpExpiry: {
      type: Date,
      select: false // OTP expiry won't be included in query results by default
    },
    personalinfo:{
      type: personalInfoSchema,
      default : null

    } , 

    loginAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    lockUntil: {
      type: Date,
      select: false
    },
    lastLogin: {
      type: Date
    },
    passwordChangedAt: {
      type: Date
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// Index for phone (email index is already created by unique: true)
userSchema.index({ phone: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    
    if (this.isModified('password')) {
      this.passwordChangedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Add this method to your User model if not already present
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('Comparing passwords:');
  console.log('Candidate password:', candidatePassword);
  console.log('Stored password:', this.password);
  const result = await bcrypt.compare(candidatePassword, this.password);
  console.log('Compare result:', result);
  return result;
};
// Method to check if user is locked out
userSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  // If lock has expired, reset attempts and remove lock
  if (this.lockUntil && this.lockUntil < Date.now()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
    return;
  }
  
  // Otherwise increment attempts
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if we've reached max attempts (e.g., 5)
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 3600000 }; // Lock for 1 hour
  }
  
  await this.updateOne(updates);
};

// Method to update last login
userSchema.methods.updateLastLogin = async function() {
  await this.updateOne({
    $set: { lastLogin: new Date() },
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Query middleware to exclude inactive users
userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);

export default User;