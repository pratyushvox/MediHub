import express from "express";
import { 
  initiatePayment, 
  verifyPayment,
  
  approveOfflinePayment,
  rejectOfflinePayment,
  
} from "../../controllers/Payment/paymentcontroller.js";
import { updatePaymentStatus } from "../../controllers/Payment/Updatepaymentstatuscontroller.js";

const router = express.Router();

// Online payments
router.post("/khalti/initiate", initiatePayment);

// Verify payments (API endpoint)
router.post("/khalti/verify", verifyPayment);

// Handle payment return (for redirect after Khalti payment)

// Offline payments
router.put("/offline/approve", approveOfflinePayment);
router.put("/offline/reject", rejectOfflinePayment );


router.put("/:appointmentId/status", updatePaymentStatus);






export default router;
