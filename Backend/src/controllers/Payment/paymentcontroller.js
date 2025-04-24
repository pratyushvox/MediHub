import Appointment from "../../models/Appointment/AppointmentModel.js";
import Payment from "../../models/Paymentmodel/Paymentmodel.js";
import axios from "axios";
import { sendNotification } from '../../controllers/Notification/Notificationcontroller.js'; // Import the notification function
import mongoose from "mongoose"; 


const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL;

// Initiate Khalti Payment
// Initiate Khalti Payment
export const initiatePayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    console.log("Initiating payment for appointment:", appointmentId);

    // Validate appointment with more detailed query
    const appointment = await Appointment.findOne({
      _id: appointmentId
    });

    if (!appointment) {
      console.error("Appointment not found:", appointmentId);
      return res.status(400).json({
        success: false,
        message: "Appointment not found"
      });
    }

    if (appointment.isBooking) {
      console.error("Appointment already booked:", appointmentId);
      return res.status(400).json({
        success: false,
        message: "Appointment already booked"
      });
    }

    // Check if payment already exists for this appointment
    const existingPayment = await Payment.findOne({ appointment: appointmentId });
    if (existingPayment) {
      console.log("Payment already exists for appointment:", appointmentId);
      
      // If payment exists but is pending, we can reuse it
      if (existingPayment.status === "Pending") {
        console.log("Using existing pending payment:", existingPayment._id);
        
        // Prepare Khalti payload with frontend return URL
        const payload = {
          return_url: `${process.env.BASE_URL}/payment/verify?paymentId=${existingPayment._id}`,
          website_url: process.env.BASE_URL,
          amount: appointment.price * 100, // Convert to paisa
          purchase_order_id: existingPayment._id.toString(),
          purchase_order_name: `Appointment_${appointmentId}`,
          customer_info: {
            name: req.user?.name || "Patient",
            email: req.user?.email || "patient@example.com",
          },
        };

        console.log("Re-initiating Khalti payment with payload:", payload);

        // Initiate Khalti payment
        const response = await axios.post(
          `${KHALTI_BASE_URL}/epayment/initiate/`,
          payload,
          {
            headers: {
              Authorization: `Key ${KHALTI_SECRET_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 10000 // 10 seconds timeout
          }
        );

        // Update the existing payment with new pidx
        await Payment.findByIdAndUpdate(
          existingPayment._id,
          { khaltiPid: response.data.pidx },
          { new: true }
        );

        console.log("Payment re-initiated successfully:", {
          paymentId: existingPayment._id,
          pidx: response.data.pidx
        });

        return res.json({
          success: true,
          payment_url: response.data.payment_url,
          paymentId: existingPayment._id,
          pidx: response.data.pidx
        });
      }
    }

    // Create new payment record
    const payment = await Payment.create({
      appointment: appointmentId,
      amount: appointment.price,
      method: "Khalti",
      status: "Pending",
    });

    console.log("Created new payment record:", payment._id);

    // Link payment to appointment
    await Appointment.findByIdAndUpdate(
      appointmentId,
      { payment: payment._id },
      { new: true }
    );

    // Prepare Khalti payload with frontend return URL
    const payload = {
      return_url: `${process.env.BASE_URL}/payment/verify?paymentId=${payment._id}`,
      website_url: process.env.BASE_URL,
      amount: appointment.price * 100, // Convert to paisa
      purchase_order_id: payment._id.toString(),
      purchase_order_name: `Appointment_${appointmentId}`,
      customer_info: {
        name: req.user?.name || "Patient",
        email: req.user?.email || "patient@example.com",
      },
    };

    console.log("Initiating Khalti payment with payload:", payload);

    // Initiate Khalti payment
    const response = await axios.post(
      `${KHALTI_BASE_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000 // 10 seconds timeout
      }
    );

    // Save Khalti's pidx to payment record
    await Payment.findByIdAndUpdate(
      payment._id,
      { khaltiPid: response.data.pidx },
      { new: true }
    );

    console.log("Payment initiated successfully:", {
      paymentId: payment._id,
      pidx: response.data.pidx
    });

    res.json({
      success: true,
      payment_url: response.data.payment_url,
      paymentId: payment._id,
      pidx: response.data.pidx // Optional: return pidx to client
    });

  } catch (error) {
    console.error("Payment initiation error:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({
      success: false,
      message: "Payment initiation failed",
      error: error.message,
      details: error.response?.data || undefined
    });
  }
};

// Verify Payment Endpoint
export const verifyPayment = async (req, res) => {
  let payment; // Declare payment variable at function scope for error handling
  
  try {
    const { paymentId, pidx } = req.body;

    // Validate input
    if (!paymentId && !pidx) {
      return res.status(400).json({ 
        success: false, 
        message: "Either paymentId or pidx is required" 
      });
    }

    // Find payment record
    if (paymentId) {
      payment = await Payment.findById(paymentId);
    } else {
      payment = await Payment.findOne({ khaltiPid: pidx });
    }

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment record not found" 
      });
    }

    // Skip verification if already completed
    if (payment.status === "Completed") {
      return res.json({ 
        success: true, 
        message: "Payment already verified",
        payment: {
          id: payment._id,
          status: payment.status,
          verifiedAt: payment.verifiedAt
        },
        appointmentId: payment.appointment
      });
    }

    // Verify with Khalti API
    const khaltiResponse = await axios.post(
      `${KHALTI_BASE_URL}/epayment/lookup/`,
      { pidx: payment.khaltiPid },
      { 
        headers: { 
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    console.log("Khalti verification response:", khaltiResponse.data);

    if (khaltiResponse.data.status !== "Completed") {
      return res.status(400).json({ 
        success: false, 
        message: "Payment not completed yet",
        khaltiStatus: khaltiResponse.data.status
      });
    }

    // Update payment status
    const updatedPayment = await Payment.findByIdAndUpdate(
      payment._id,
      { 
        status: "Completed",
        verifiedAt: new Date(),
        khaltiResponse: khaltiResponse.data // Store full response for reference
      },
      { new: true }
    );

    // Update appointment status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      payment.appointment,
      { 
        isBooking: true,
        approvedByAdmin: "Accepted",
        paymentStatus: "Paid",
        lastUpdated: new Date()
      },
      { new: true }
    );

    console.log("Payment verified successfully:", {
      paymentId: payment._id,
      appointmentId: payment.appointment
    });

    res.json({ 
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: updatedPayment._id,
        amount: updatedPayment.amount,
        method: updatedPayment.method,
        status: updatedPayment.status,
        verifiedAt: updatedPayment.verifiedAt
      },
      appointment: {
        id: updatedAppointment._id,
        status: updatedAppointment.status
      },
      appointmentId: payment.appointment // For backward compatibility
    });
    
  } catch (error) {
    console.error("Payment verification failed:", {
      error: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    // Update payment status to failed if we found a record
    if (payment) {
      await Payment.findByIdAndUpdate(
        payment._id,
        { 
          status: "Failed", 
          error: error.message,
          verificationAttempts: { $inc: 1 } 
        }
      );
    }

    res.status(500).json({ 
      success: false, 
      message: "Payment verification failed",
      error: error.message,
      details: error.response?.data || undefined
    });
  }
};
  

// Admin approval for offline payments
const formatAppointmentDate = (date) => 
  new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const approveOfflinePayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required' });
    }

    // Update appointment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { isBooking: true, approvedByAdmin: 'Accepted' },
      { new: true }
    )
      .populate('bookedDoctor')
      .populate('bookedPatient');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Create payment record
    const payment = await Payment.create({
      appointment: appointmentId,
      amount: appointment.price,
      method: 'Cash',
      status: 'Pending'
    });

    // Link payment to appointment
    appointment.payment = payment._id;
    await appointment.save();

    // Send notification to patient
    const doctorName = appointment.bookedDoctor?.name || 'your doctor';
    const message = `Your appointment with Dr. ${doctorName} on ${formatAppointmentDate(appointment.appointmentDate)} at ${appointment.appointmentTime} has been approved.`;
    await sendNotification(appointment.bookedPatient._id.toString(), message, 'patient');

    return res.json({ success: true, appointment, payment });
  } catch (error) {
    console.error('[Approval Error]', error);
    return res.status(500).json({ success: false, message: 'Approval failed', error: error.message });
  }
};

export const rejectOfflinePayment = async (req, res) => {
  try {
    const { appointmentId, rejectionReason } = req.body;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required' });
    }

    // Update appointment status
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        isBooking: false,
        approvedByAdmin: 'Rejected',
        rejectionReason: rejectionReason || 'No reason provided'
      },
      { new: true }
    )
      .populate('bookedDoctor')
      .populate('bookedPatient');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Remove the booked slot from doctor
    if (appointment.bookedDoctor?.bookedslots) {
      const doctor = appointment.bookedDoctor;
      doctor.bookedslots = doctor.bookedslots.filter(
        slot => {
          const slotDate = new Date(slot.date);
          const appointmentDate = new Date(appointment.appointmentDate);
          return !(slotDate.toISOString() === appointmentDate.toISOString() && slot.time === appointment.appointmentTime);
        }
      );
      
      await doctor.save();
    }

    // Send notification to patient
    const doctorName = appointment.bookedDoctor?.name || 'your doctor';
    let message = `Your appointment with Dr. ${doctorName} on ${formatAppointmentDate(appointment.appointmentDate)} at ${appointment.appointmentTime} has been rejected.`;
    if (rejectionReason) {
      message += ` Reason: ${rejectionReason}`;
    }
    await sendNotification(appointment.bookedPatient._id.toString(), message, 'patient');

    return res.json({ success: true, appointment });
  } catch (error) {
    console.error('[Rejection Error]', error);
    return res.status(500).json({ success: false, message: 'Rejection failed', error: error.message });
  }
};
