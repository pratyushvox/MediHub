import Appointment from "../../models/Appointment/AppointmentModel.js";
import Doctor from "../../models/Doctor/Doctorsignupmodel.js";


export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the appointment to delete
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Find the doctor associated with the appointment
        const doctor = await Doctor.findById(appointment.bookedDoctor);
        if (doctor) {
            // Remove the booked slot (matching date and time)
            doctor.bookedslots = doctor.bookedslots.filter(slot => 
                slot.date !== appointment.appointmentDate || slot.time !== appointment.appointmentTime
            );

            // Save the updated doctor model
            await doctor.save();
        }

        // Delete the appointment
        await Appointment.findByIdAndDelete(id);

        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
