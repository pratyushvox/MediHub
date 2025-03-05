import express from 'express';
import { doctorSignup } from '../../controllers/Doctor/Doctorsingupcontroller.js';
import { doctorLogin } from '../../controllers/Doctor/Doctorlogincontroller.js';
import { getDoctors } from '../../controllers/Doctor/Doctorlistcontroller.js';

const router = express.Router();

// POST route for doctor signup
router.post('/doctor/signup', doctorSignup);

//for login 
router.post('/doctor/login', doctorLogin);

//for getting doctor list 

router.get('/doctor/getdoctor',getDoctors );



export default router;
