import User from '../../models/Usermodel/userModel.js'; // Assuming you have a User model

// Controller to handle saving the profile picture URL to the user's profile
export const uploadProfilePicture = async (req, res) => {
  try {
    // If no file was uploaded, send an error response
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Get the URL of the uploaded image from Cloudinary response
    const imageUrl = req.file.path; // Cloudinary's 'path' is the URL to the uploaded image

    // Find the user by the userId in the URL parameter
    const user = await User.findById(req.params.userId); // Use req.params.userId to get the user

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save the image URL to the user's profile
    user.profilePic = imageUrl;  // Assuming 'profilePic' is the field for the image URL in your model
    await user.save();

    // Send success response with the new profile picture URL
    return res.status(200).json({ message: 'Profile picture updated', profilePic: imageUrl });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
};
