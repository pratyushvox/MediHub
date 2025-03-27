// controllers/paymentController.js
import Appointment from "../../models/Appointment/AppointmentModel.js";
import Payment from "../../models/Paymentmodel/Paymentmodel.js";
import axios from "axios";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL;

console.log("KHALTI_BASE_URL:", KHALTI_BASE_URL);
console.log("Full payment URL:", `${KHALTI_BASE_URL}/epayment/initiate/`);

// Initiate Khalti Payment
// Initiate Khalti Payment
export const initiatePayment = async (req, res) => {
    try {
      const { appointmentId } = req.body;
  
      // Validate appointment
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        paymentMethod: "Khalti",
        isBooking: false
      });
  
      if (!appointment) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid appointment or already booked" 
        });
      }
  
      // Create payment record
      const payment = await Payment.create({
        appointment: appointmentId,
        amount: appointment.price,
        method: "Khalti",
        status: "Pending"
      });
  
      // Prepare Khalti payload
      const payload = {
        return_url: `${process.env.BASE_URL}/api/payments/khalti/return`, // Using BASE_URL
        website_url: process.env.BASE_URL,
        amount: appointment.price * 100, // Convert to paisa
        purchase_order_id: payment._id.toString(),
        purchase_order_name: `Appointment_${appointmentId}`,
        customer_info: {
          name: req.user?.name || "Patient", // Get from authenticated user
          email: req.user?.email || "patient@example.com"
        }
      };
  
      console.log("Sending payload to Khalti:", payload);
  
      // Initiate Khalti payment
      const response = await axios.post(
        `${process.env.KHALTI_BASE_URL}/epayment/initiate/`,
        payload,
        { 
          headers: { 
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json'
          } 
        }
      );
  
      console.log("Khalti response:", response.data);
  
      res.json({
        success: true,
        payment_url: response.data.payment_url
      });
  
    } catch (error) {
      console.error("Payment error:", error.response?.data || error.message);
      res.status(500).json({
        success: false,
        message: "Payment initiation failed",
        error: error.response?.data?.detail || error.message
      });
    }
  };


  // Handle Khalti return URL redirect
// Handle Khalti return URL redirect
export const handlePaymentReturn = async (req, res) => {
  try {
    const { pidx, purchase_order_id } = req.query;
    
    if (!pidx) {
      return res.redirect(`${process.env.BASE_URL}/Patient/BookAppointment?payment=failed&reason=missing_pidx`);
    }

    // Verify payment with Khalti
    const verification = await verifyPayment({
      body: { pidx, appointmentId: purchase_order_id }
    }, res);

    // If verification failed
    if (!verification.success) {
      return res.redirect(
        `${process.env.BASE_URL}/Patient/BookAppointment?payment=failed&reason=${verification.error || "verification_failed"}`
      );
    }

    // On success: Redirect back to booking page with success status
    res.redirect(
      `${process.env.BASE_URL}/Patient/BookAppointment?payment=success&appointmentId=${purchase_order_id}`
    );

  } catch (error) {
    console.error('Return URL handling error:', error);
    res.redirect(
      `${process.env.BASE_URL}/Patient/BookAppointment?payment=failed&reason=server_error`
    );
  }
};

// Verify Khalti Payment 
export const verifyPayment = async (req, res) => {
  // Support both API calls (req.body) and redirects (req.query)
  const { pidx, appointmentId } = req.body || req.query;
  
  if (!pidx) {
    // Handle both API response and redirect case
    if (res) {
      return res.status(400).json({
        success: false,
        message: "pidx is required",
      });
    }
    return { success: false, message: "pidx is required" };
  }

  try {
    // Verify with Khalti
    const khaltiResponse = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx },
      { headers: { Authorization: `Key ${KHALTI_SECRET_KEY}` } }
    );

    if (khaltiResponse.data.status !== "Completed") {
      throw new Error("Payment not completed");
    }

    // Get the appointment ID either from params or Khalti response
    const resolvedAppointmentId = appointmentId || khaltiResponse.data.purchase_order_id;

    // Update payment record
    const updatedPayment = await Payment.findOneAndUpdate(
      { _id: khaltiResponse.data.purchase_order_id },
      { status: "Completed" },
      { new: true }
    );

    // Confirm appointment booking
    await Appointment.findByIdAndUpdate(resolvedAppointmentId, {
      isBooking: true,
      approvedByAdmin: true,
      paymentStatus: "Paid"
    });

    // Return appropriate response based on context
    if (res) {
      return res.json({ 
        success: true,
        payment: updatedPayment,
        appointmentId: resolvedAppointmentId
      });
    }
    
    // For redirect cases
    return { 
      success: true, 
      payment: updatedPayment,
      appointmentId: resolvedAppointmentId
    };

  } catch (error) {
    console.error("Payment verification error:", error.message);

    // Mark payment as failed
    await Payment.findOneAndUpdate(
      { khaltiPid: pidx },
      { status: "Failed" }
    );

    // Return appropriate error response
    if (res) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
        error: error.message
      });
    }
    
    return { 
      success: false, 
      error: error.message,
      message: "Payment verification failed" 
    };
  }
};
  

// Admin approval for offline payments
export const approveOfflinePayment = async (req, res) => {
    try {
      const { appointmentId } = req.body;
  
      // Update and fetch the appointment first
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { 
          isBooking: true,
          approvedByAdmin: true,
          paymentStatus: "Free"
        },
        { new: true }
      );
  
      // Check if appointment exists
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found"
        });
      }
  
      // Create the payment
      const payment = await Payment.create({
        appointment: appointmentId,
        amount: appointment.price, // Now appointment is defined
        method: "Cash",
        status: "Completed"
      });
  
      res.json({ 
        success: true,
        appointment,
        payment
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Approval failed",
        error: error.message
      });
    }
  };
  