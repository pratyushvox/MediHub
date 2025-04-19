import Doctor from '../../models/Doctor/Doctorsignupmodel.js'; // Adjust path if needed

// Controller to handle uploading and saving doctor profile picture
export const uploadDoctorProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const imageUrl = req.file.path;

    const doctor = await Doctor.findById(req.params.docid);// doctorId passed as URL param

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    doctor.profilePic = imageUrl;
    await doctor.save();

    return res.status(200).json({
      message: 'Doctor profile picture updated',
      profilePic: imageUrl
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error uploading doctor image',
      error: error.message
    });
  }
};
