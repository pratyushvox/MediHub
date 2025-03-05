import User from '../../models/Usermodel/userModel.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password for security
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};
