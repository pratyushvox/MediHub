import bcrypt from 'bcrypt';
import Doctor from '../../models/Doctor/Doctorsignupmodel.js';

// Controller to handle doctor signup
const doctorSignup = async (req, res) => {
  const { name, availableTime, specialist, address, experience, degree, phone, email, password } = req.body;

  try {
    // Check if doctor already exists by email
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new doctor
    const newDoctor = new Doctor({
      name,
      availableTime,
      specialist,
      address,
      experience,
      degree,
      phone,
      email,
      password: hashedPassword
    });

    // Save the doctor to the database
    await newDoctor.save();

    res.status(201).json({ message: 'Doctor signed up successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { doctorSignup };
