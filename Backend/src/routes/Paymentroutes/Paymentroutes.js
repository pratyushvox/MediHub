import express from "express";
import { 
  initiatePayment, 
  verifyPayment,
  handlePaymentReturn, // Add this new handler
  approveOfflinePayment
} from "../../controllers/Payment/paymentcontroller.js";

const router = express.Router();

// Online payments
router.post("/khalti/initiate", initiatePayment);

// Verify payments (API endpoint)
router.post("/khalti/verify", verifyPayment);

// Handle payment return (for redirect after Khalti payment)
router.get("/khalti/return", handlePaymentReturn);

// Offline payments
router.post("/offline/approve", approveOfflinePayment);

export default router;