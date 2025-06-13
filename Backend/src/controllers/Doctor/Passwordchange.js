import bcrypt from 'bcryptjs';
import Doctor from '../../models/Doctor/Doctorsignupmodel.js';


const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const doctorId = req.params.id;

  try {
    // Validate request
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Find the doctor by ID
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the current password is correct
    const isPasswordCorrect = await bcrypt.compare(currentPassword, doctor.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is the same as current password
    const isSamePassword = await bcrypt.compare(newPassword, doctor.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'New password cannot be the same as current password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the doctor's password
    doctor.password = hashedPassword;
    await doctor.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { changePassword };