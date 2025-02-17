import User from '../../models/Usermodel/userModel.js';
import bcrypt from 'bcryptjs';
import otpController from '../OTPController.js';

export const requestOTP = async (req, res) => {
  try {
    const { email, name, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    await otpController.sendOTP(email, name, phone, password);
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const verificationResult = otpController.verifyOTP(email, otp);
    
    if (!verificationResult.success) {
      return res.status(400).json({ message: verificationResult.message });
    }
    
    const { tempUser } = verificationResult;
    
    // Create new user with plain password - it will be hashed by the pre-save middleware
    const newUser = new User({
      email,
      name: tempUser.name,
      phone: tempUser.phone,
      password: tempUser.password,  // Plain password - will be hashed by middleware
      verified: true,
      personalinfo: null
    });
    
    await newUser.save();
    
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const resendResult = await otpController.resendOTP(email);

    if (!resendResult.success) {
      return res.status(400).json({ message: resendResult.message });
    }

    res.status(200).json({ message: resendResult.message });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
};
