// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ["Khalti", "Cash"],
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending"
  },
  khaltiPid: String,
  metadata: mongoose.Schema.Types.Mixed // For additional payment details
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;