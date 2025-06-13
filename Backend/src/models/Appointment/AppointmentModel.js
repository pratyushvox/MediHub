import mongoose from "mongoose";
import User from "../../models/Usermodel/userModel.js";
import Doctor from "../../models/Doctor/Doctorsignupmodel.js";
import Payment from "../../models/Paymentmodel/Paymentmodel.js";


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
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
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
            default: false
        },
        price: { 
            type: Number, 
            required: true 
        },
        khaltiPid: {
            type: String,
            default: null
        },
        approvedByAdmin: {
            type: String,
            enum: ["Accepted", "Rejected", ""],
            default: ""
        },
        consultationStatus: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "pending"
        },
        consultationNotes: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;