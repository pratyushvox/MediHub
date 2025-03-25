// routes/paymentRoutes.js
import express from "express";
import { 
  initiatePayment, 
  verifyPayment,
  approveOfflinePayment
} from "../../controllers/Payment/paymentcontroller.js";

const router = express.Router();

// Online payments
router.post("/khalti/initiate", initiatePayment);
//verify payments 
router.post("/khalti/verify", verifyPayment);

// Offline payments
router.post("/offline/approve", approveOfflinePayment);

export default router;