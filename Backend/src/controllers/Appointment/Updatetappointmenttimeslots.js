import Appointment from "../../models/Appointment/AppointmentModel.js";
import Doctor from "../../models/Doctor/Doctorsignupmodel.js";
import { sendNotification } from "../../controllers/Notification/Notificationcontroller.js";

export const updateAppointmentTime = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { newAppointmentDate, newAppointmentTime } = req.body;

        // Validate required fields
        if (!newAppointmentDate || !newAppointmentTime) {
            return res.status(400).json({ message: "Both date and time are required" });
        }

        // Find the existing appointment and populate doctor and patient
        const appointment = await Appointment.findById(appointmentId)
            .populate('bookedDoctor', 'name')
            .populate('bookedPatient', 'name');

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Check if the appointment is already completed or cancelled
        if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
            return res.status(400).json({ message: "Cannot modify a completed or cancelled appointment" });
        }

        // Get the old date and time before updating
        const oldDate = appointment.appointmentDate;
        const oldTime = appointment.appointmentTime;

        // Update the appointment
        appointment.appointmentDate = newAppointmentDate;
        appointment.appointmentTime = newAppointmentTime;
        appointment.isBooking = false; // Reset booking status
        appointment.approvedByAdmin = "Accepted"; // Auto-approve when time is updated ✅

        const updatedAppointment = await appointment.save();

        // Find the doctor and update their slots
        const doctor = await Doctor.findById(appointment.bookedDoctor);
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // Remove the old slot from doctor's bookedslots
        doctor.bookedslots = doctor.bookedslots.filter(slot => 
            !(slot.date === oldDate && slot.time === oldTime)
        );

        // Add the new slot to doctor's bookedslots
        doctor.bookedslots.push({
            date: newAppointmentDate,
            time: newAppointmentTime
        });

        await doctor.save();

        // Send notifications to both patient and doctor
        const formattedNewDate = new Date(newAppointmentDate).toLocaleDateString();
        
        // Notification for patient
        await sendNotification(
            appointment.bookedPatient,
            `Your appointment with ${appointment.bookedDoctor.name} has been rescheduled to ${formattedNewDate} at ${newAppointmentTime}.`,
            'patient'
        );

        // Notification for doctor
        await sendNotification(
            appointment.bookedDoctor,
            `Your appointment with ${appointment.bookedPatient?.name} has been rescheduled to ${formattedNewDate} at ${newAppointmentTime}.`,
            'doctor'
        );

        return res.status(200).json({ 
            message: "Appointment time updated successfully", 
            appointment: updatedAppointment 
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message 
        });
    }
};