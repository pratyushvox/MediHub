


// Route used: /appointments/:appointmentId/ConsultationStatus
import mongoose from "mongoose";
import Appointment from "../../models/Appointment/AppointmentModel.js";

export const UpdateConsultationStatusandNotes = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { consultationStatus, consultationNotes, doctorId } = req.body;

    // Validate required fields
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required",
      });
    }

    if (!consultationStatus || !["pending", "completed", "cancelled"].includes(consultationStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation status",
      });
    }

    // Convert doctorId to ObjectId
    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    // Debug logs
    console.log("Finding appointment with ID:", appointmentId);
    console.log("Expected doctorId:", doctorObjectId);

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if the logged-in doctor matches
    if (!appointment.bookedDoctor.equals(doctorObjectId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You are not the booked doctor for this appointment",
      });
    }

    // Check if the appointment is approved
    if (appointment.approvedByAdmin !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Cannot update unapproved appointments",
      });
    }

    // Prepare update fields
    const updateFields = {
      consultationStatus,
      updatedAt: new Date(),
    };

    if (consultationNotes && consultationNotes.trim() !== "") {
      updateFields.consultationNotes = consultationNotes.trim();
    }

    // Perform update
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate("bookedPatient", "name email phone personalinfo")
      .populate("bookedDoctor", "name specialist");

    res.status(200).json({
      success: true,
      message: "Consultation status updated successfully",
      data: updatedAppointment,
    });

  } catch (error) {
    console.error("Error updating consultation status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


//update consultaion status

