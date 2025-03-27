import mongoose from "mongoose";
import User from "../Usermodel/userModel.js";


const appointmentSchema = new mongoose.Schema(
    {
        bookedPatient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        bookedDoctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
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
        paymentMethod: {
            type: String,
            enum: ["Khalti", "Cash", null],
            default: null
        },
        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Free"],
            default: "Pending"
        },
        khaltiPid: {
            type: String, // Stores Khalti transaction ID for online payments
            default: null
        },
        approvedByAdmin: {
            type: Boolean,
            default: false // Becomes true for online payments OR when admin approves offline
        }
    },
    {
        timestamps: true
    }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;