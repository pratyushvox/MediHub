import Appointment from "../../models/Appointment/AppointmentModel.js";

export const updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { isBooking } = req.body;

        // Find the appointment by ID
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Update the appointment status
        appointment.isBooking = isBooking;
        await appointment.save();

        res.status(200).json({ message: "Appointment status updated successfully", appointment });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
