import nodemailer from 'nodemailer';
import User from '../models/Usermodel/userModel.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME || 'medihubclinic1@gmail.com', // Your Gmail
    pass: process.env.EMAIL_PASSWORD || 'jyluvvinryzpdovd' // Your App Password
  }
});

export const sendMeetLink = async (req, res) => {
  try {
    const { userId, meetLink, appointmentTime, doctorName } = req.body;
    
    // Input validation
    if (!userId || !meetLink || !appointmentTime || !doctorName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Validate Google Meet link format
    if (!meetLink.includes('meet.google.com')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google Meet link format'
      });
    }

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Email content
    const mailOptions = {
      from: `"MediHub Clinic" <${process.env.EMAIL_USERNAME || 'medihubclinic1@gmail.com'}>`,
      to: user.email,
      subject: `Your Online Consultation with Dr. ${doctorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d3748;">MediHub Clinic Appointment</h2>
          <p>Dear ${user.name},</p>
          <p>Your online consultation with <strong>Dr. ${doctorName}</strong> is scheduled for:</p>
          <p style="background: #f7fafc; padding: 12px; border-radius: 4px;">
            <strong>Date & Time:</strong> ${new Date(appointmentTime).toLocaleString()}
          </p>
          <p>Please join using the following Google Meet link:</p>
          <a href="${meetLink}" 
             style="display: inline-block; background: #4299e1; color: white; 
                    padding: 12px 24px; border-radius: 4px; text-decoration: none;
                    margin: 12px 0;">
            Join Consultation
          </a>
          <p>If you have any questions, please reply to this email.</p>
          <p>Best regards,<br/>MediHub Clinic Team</p>
        </div>
      `
    };

    // Verify transporter connection first
    await transporter.verify((error, success) => {
      if (error) {
        console.error('Server is not ready to take messages:', error);
        throw new Error('Email server configuration error');
      } else {
        console.log('Server is ready to take messages');
      }
    });

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Meet link sent successfully',
      data: {
        patientName: user.name,
        email: user.email,
        sentAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send meet link',
      error: error.message 
    });
  }
};