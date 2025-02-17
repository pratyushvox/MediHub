import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Temporary storage for OTPs before final user creation
const tempUsers = new Map();

export const sendOTP = async (email, name, phone, password) => {
  const otp = generateOTP();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

  tempUsers.set(email, { name, phone, password, otp, otpExpiry });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'MediHub Email Verification',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3CB5AC;">Welcome to MediHub!</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #0665A7; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>The MediHub Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const verifyOTP = (email, otp) => {
  if (!tempUsers.has(email)) {
    return { success: false, message: 'Invalid verification attempt' };
  }

  const tempUser = tempUsers.get(email);

  if (tempUser.otp !== otp) {
    return { success: false, message: 'Invalid OTP' };
  }

  if (new Date() > tempUser.otpExpiry) {
    tempUsers.delete(email);
    return { success: false, message: 'OTP has expired' };
  }

  return { success: true, tempUser };
};

export const resendOTP = async (email) => {
  if (!tempUsers.has(email)) {
    return { success: false, message: 'Invalid resend request' };
  }

  const otp = generateOTP();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

  tempUsers.set(email, { ...tempUsers.get(email), otp, otpExpiry });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'MediHub - New Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3CB5AC;">New Verification Code</h2>
        <p>Your new verification code is:</p>
        <h1 style="color: #0665A7; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>The MediHub Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return { success: true, message: 'New OTP sent successfully' };
};

export default { sendOTP, verifyOTP, resendOTP };
