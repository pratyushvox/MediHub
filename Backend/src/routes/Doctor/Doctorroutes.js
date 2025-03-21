import express from 'express';
import { doctorSignup } from '../../controllers/Doctor/Doctorsingupcontroller.js';
import { doctorLogin } from '../../controllers/Doctor/Doctorlogincontroller.js';
import { getDoctors } from '../../controllers/Doctor/Doctorlistcontroller.js';
import { getDoctorDetails } from '../../controllers/Doctor/Doctordetailscontroller.js';
import updateDocDetails from '../../controllers/Doctor/UpdateDocdetailscontroller.js';

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

export default router;
