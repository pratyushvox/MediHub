import mongoose from "mongoose";
import User from "../../models/Usermodel/userModel.js";
import Doctor from "../../models/Doctor/Doctorsignupmodel.js";
import Payment from "../../models/Paymentmodel/Paymentmodel.js"; // Import the Payment model

const appointmentSchema = new mongoose.Schema(
    {
        bookedPatient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to User model
            required: true
        },
        bookedDoctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor", // Reference to Doctor model
            required: true
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment", // Reference to Payment model
            required: false
        },
        appointmentType: { 
            type: String, 
            required: true 
        },
        appointmentReason: { 
            type: String, 
            required: true 
        },
        appointmentDate: { 
            type: String, 
            required: true 
        },
        appointmentTime: { 
            type: String, 
            required: true 
        },
        isBooking: { 
            type: Boolean, 
            default: false // Default false (only true after online payment or admin approval)
        },
        price: { 
            type: Number, 
            required: true 
        },
        khaltiPid: {
            type: String, // Stores Khalti transaction ID for online payments
            default: null
        },
        approvedByAdmin: {
            type: String,
            enum: ["Accepted", "Rejected", ""], // Empty by default, updated later
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
