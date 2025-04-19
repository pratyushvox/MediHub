import express from 'express';
import { doctorSignup } from '../../controllers/Doctor/Doctorsingupcontroller.js';
import { doctorLogin } from '../../controllers/Doctor/Doctorlogincontroller.js';
import { getDoctors } from '../../controllers/Doctor/Doctorlistcontroller.js';
import { getDoctorDetails } from '../../controllers/Doctor/Doctordetailscontroller.js';
import updateDocDetails from '../../controllers/Doctor/UpdateDocdetailscontroller.js';
import { deleteDoctor } from '../../controllers/Doctor/DeleteDocdetails.js';
import upload from '../../Cloudinary/Cloudinaryupload.js'; // Import the multer + cloudinary upload middleware
import { uploadDoctorProfilePicture} from '../../controllers/Doctor/Uploaddocprofile.js'; // The controller to handle after upload


const router = express.Router();

// POST route for doctor signup
router.post('/doctor/signup', doctorSignup);

// POST route for doctor login 
router.post('/doctor/login', doctorLogin);

// GET route for fetching doctor list 
router.get('/doctor/getdoctor', getDoctors);

// GET route for fetching a doctor's details by ID
router.get('/doctor/:docid', getDoctorDetails);

// PUT route for updating doctor details
router.put('/doctor/updatedetails/:docid',updateDocDetails);

// delete a doctor 
router.delete("/doctor/deletedoctor/:docid", deleteDoctor);


//uploading doc profile 
router.post(
    '/doctor/upload-profile/:docid',
    upload.single('profilePic'),
    uploadDoctorProfilePicture
  );

export default router;
