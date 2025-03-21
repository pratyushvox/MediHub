import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Doctor from '../../models/Doctor/Doctorsignupmodel.js';

// Controller to handle doctor signup
const doctorSignup = async (req, res) => {
  const { name, availableTime, specialist, address, experience, degree, phone, email, password, price } = req.body; // Added price

  try {
    // Check if doctor already exists by email
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a JWT token
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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
      password: hashedPassword,
      price, // Added price field
      doctorToken: token, // Store token in DB
      verified: true, // Assuming the doctor is verified upon signup
    });

    // Save the doctor to the database
    await newDoctor.save();

    res.status(201).json({
      message: 'Doctor signed up successfully',
      token,
      doctor: {
        id: newDoctor._id,
        name: newDoctor.name,
        email: newDoctor.email,
        phone: newDoctor.phone,
        specialist: newDoctor.specialist,
        price: newDoctor.price, // Included price in response
      },
    });
  } catch (error) {
    console.error('Doctor signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { doctorSignup };
