import User from '../../models/Usermodel/userModel.js';
import { checkEmailExists } from './Emailcheckercontroller.js';
import { sendOTP, verifyOTP } from '../OTPController.js';
import bcrypt from 'bcryptjs';

export const forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // First check if email exists in database
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "No account found with this email address" 
      });
    }

    // Generate and send OTP
    try {
      await sendOTP(
        email,
        user.name,
        user.phone,
        user.password
      );

      return res.status(200).json({
        success: true,
        message: "Password reset OTP has been sent to your email"
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later."
      });
    }
  } catch (error) {
    console.error("Error in forgot password request:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing your request"
    });
  }
};

export const  verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    // Verify the OTP
    const verificationResult = verifyOTP(email, otp);

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
      email: email
    });

  } catch (error) {
    console.error("Error in OTP verification:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying OTP"
    });
  }
};

export const resendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Verify user exists before resending
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }

    // Resend OTP
    const resendResult = await resendOTP(email);

    if (!resendResult.success) {
      return res.status(400).json({
        success: false,
        message: resendResult.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "New OTP has been sent to your email"
    });

  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resending OTP"
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      });
    }

    // Verify OTP one last time
    const verificationResult = verifyOTP(email, otp);
    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as old password"
      });
    }

    // Update password
    user.password = newPassword; // The pre-save hook will hash this
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully"
    });

  } catch (error) {
    console.error("Error in password reset:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while resetting password"
    });
  }
};

export default {
  forgotPasswordRequest,
  verifyForgotPasswordOTP,
  resendForgotPasswordOTP,
  resetPassword
};