import express from 'express';
import { requestOTP, verifyOTP, resendOTP } from '../controllers/Usercontroller/Signupcontroller.js';
import { loginUser } from '../controllers/Usercontroller/Logincontroller.js';
import { checkEmailExists } from '../controllers/Usercontroller/Emailcheckercontroller.js';
import { forgotPasswordRequest, verifyForgotPasswordOTP ,resetPassword } from '../controllers/Usercontroller/Forgetpasswordcontroller.js';
import { updatePersonalInfo } from '../controllers/Usercontroller/Personalinfocontroller.js';
import { getUserDetails } from "../controllers/Usercontroller/UserDetailsController.js";

const router = express.Router();

// Signup Routes
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Email check route
router.post('/check-email', checkEmailExists);

// Login Route
router.post('/login', loginUser);

// Forgot Pass Route
router.post('/forgot-pass', forgotPasswordRequest);
router.post('/verify-forgotpass-otp', verifyForgotPasswordOTP);
router.post('/reset-pass',resetPassword)

//update personalinfo routes 
router.put("/update-personal-info/:userId", updatePersonalInfo);

//getting user details 
router.get("/:userId", getUserDetails);


export default router;