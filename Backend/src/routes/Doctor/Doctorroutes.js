import express from 'express';
import { doctorSignup } from '../../controllers/Doctor/Doctorsingupcontroller.js';
import { doctorLogin } from '../../controllers/Doctor/Doctorlogincontroller.js';

const router = express.Router();

// POST route for doctor signup
router.post('/doctor/signup', doctorSignup);

//for login 
router.post('/doctor/login', doctorLogin);

export default router;
