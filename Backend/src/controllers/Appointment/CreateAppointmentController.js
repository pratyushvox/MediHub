import Appointment from "../../models/Appointment/AppointmentModel.js";
import Doctor from "../../models/Doctor/Doctorsignupmodel.js";

export const createAppointment = async (req, res) => {
    try {
        const { 
            bookedPatient, 
            bookedDoctor, 
            appointmentType, 
            appointmentReason, 
            appointmentDate, 
            appointmentTime, 
            paymentMethod,  // 'online' or 'offline'
            price ,
            

        } = req.body;

        // Validate required fields
        if (!bookedPatient || !bookedDoctor || !appointmentType || 
            !appointmentReason || !appointmentDate || !appointmentTime || 
            !paymentMethod || price === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create new appointment (isBooking is FALSE by default for both cases)
        const newAppointment = new Appointment({
            bookedPatient,
            bookedDoctor,
            appointmentType,
            appointmentReason,
            appointmentDate,
            appointmentTime,
            price,
            paymentMethod: paymentMethod === 'online' ? 'Khalti' : 'Cash',
            isBooking: false, // Always false initially - will update after payment/admin approval
            approvedByAdmin: "", // Will become true after payment verification
            paymentStatus: paymentMethod === 'online' ? 'Pending' : 'Pending', // Both start as Pending
            
        });

        await newAppointment.save();


        

        const doctor = await Doctor.findById(bookedDoctor);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Add the appointment's date and time to the doctor's bookedslots
        doctor.bookedslots.push({
            date: appointmentDate,
            time: appointmentTime
        })

        const updatedDoctor = await doctor.save();
        

        // Different responses based on payment method
        if (paymentMethod === 'online') {
            return res.status(201).json({ 
                message: "Appointment created - proceed to payment", 
                appointment: newAppointment,
                requiresPayment: true,
                appointmentId: newAppointment._id
            });
        } else {
            return res.status(201).json({ 
                message: "Appointment request sent for admin approval", 
                appointment: newAppointment,
                requiresPayment: false
            });
        }

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};