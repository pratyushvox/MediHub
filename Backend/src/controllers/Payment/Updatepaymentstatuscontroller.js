import Appointment from "../../models/Appointment/AppointmentModel.js";
import Payment from "../../models/Paymentmodel/Paymentmodel.js";

export const updatePaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    // Validate the status
    const validStatuses = ["Pending", "Completed", "Failed", "Refunded"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId)
      .populate("bookedPatient")
      .populate("bookedDoctor")
      .populate("payment");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check if payment exists
    if (!appointment.payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found for this appointment",
      });
    }

    // Update the payment status
    const updatedPayment = await Payment.findByIdAndUpdate(
      appointment.payment._id,
      { status },
      { new: true }
    );

    // If payment is completed, update appointment status if needed
    if (status === "Completed" && !appointment.isBooking) {
      appointment.isBooking = true;
      await appointment.save();
    }

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: {
        appointment,
        payment: updatedPayment,
      },
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};