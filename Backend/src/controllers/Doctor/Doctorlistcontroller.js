import Doctor from '../../models/Doctor/Doctorsignupmodel.js';

// Controller to get the list of doctors
const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}, '-password'); // Exclude password field for security
    res.status(200).json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getDoctors };
