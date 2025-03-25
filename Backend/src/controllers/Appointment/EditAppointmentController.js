import Appointment from "../../models/Appointment/AppointmentModel.js";

export const editAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedAppointment = await Appointment.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedAppointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json({ message: "Appointment updated successfully", appointment: updatedAppointment });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
