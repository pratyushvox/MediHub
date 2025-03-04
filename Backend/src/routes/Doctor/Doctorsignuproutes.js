import express from 'express';
import { doctorSignup } from '../../controllers/Doctor/Doctorsingupcontroller.js';

const router = express.Router();

// POST route for doctor signup
router.post('/doctor/signup', doctorSignup);

export default router;
