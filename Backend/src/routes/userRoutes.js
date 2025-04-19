import express from 'express';
import { requestOTP, verifyOTP, resendOTP } from '../controllers/Usercontroller/Signupcontroller.js';
import { loginUser } from '../controllers/Usercontroller/Logincontroller.js';
import { checkEmailExists } from '../controllers/Usercontroller/Emailcheckercontroller.js';
import { forgotPasswordRequest, verifyForgotPasswordOTP ,resetPassword } from '../controllers/Usercontroller/Forgetpasswordcontroller.js';
import { updatePersonalInfo } from '../controllers/Usercontroller/Personalinfocontroller.js';
import { getUserDetails } from "../controllers/Usercontroller/UserDetailsController.js";
import { getAllUsers } from '../controllers/Usercontroller/Usersdetails.js';
import { updateUserDetailsController } from '../controllers/Usercontroller/Updateuserdetails.js';
import { deletePatient } from '../controllers/Usercontroller/Deletepatientdetails.js';
import upload from '../Cloudinary/Cloudinaryupload.js'; // Import the multer + cloudinary upload middleware
import { uploadProfilePicture } from '../controllers/Usercontroller/Uploadprofilepicture.js'; // The controller to handle after upload


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

//getting all user details
router.get("/users", getAllUsers);
//getting user details 
router.get("/:userId", getUserDetails);


//  updating the userdetails editig 
router.put("/update-user-details/:userId", updateUserDetailsController)


// deleting the user details 
router.delete('/delete/:userId', deletePatient);

//uploading the picture

router.post('/upload-profile/:userId', upload.single('image'), uploadProfilePicture);








export default router;