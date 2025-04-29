// Inside your appointment controller file
import Appointment from "../../models/Appointment/AppointmentModel.js";
import Doctor from "../../models/Doctor/Doctorsignupmodel.js";
import Admin from "../../models/Admin/Adminmodel.js";
import User from "../../models/Usermodel/userModel.js";
import { sendNotification } from "../../controllers/Notification/Notificationcontroller.js";

export const createAppointment = async (req, res) => {
  try {
    const {
      bookedPatient,
      bookedDoctor,
      appointmentType,
      appointmentReason,
      appointmentDate,
      appointmentTime,
      paymentMethod, // 'online' or 'offline'
      price,
    } = req.body;

    // 1) Validate
    if (
      !bookedPatient ||
      !bookedDoctor ||
      !appointmentType ||
      !appointmentReason ||
      !appointmentDate ||
      !appointmentTime ||
      !paymentMethod ||
      price === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2) Create appointment
    const newAppointment = new Appointment({
      bookedPatient,
      bookedDoctor,
      appointmentType,
      appointmentReason,
      appointmentDate,
      appointmentTime,
      price,
      paymentMethod: paymentMethod === 'online' ? 'Khalti' : 'Cash',
      isBooking: false,
      approvedByAdmin: "",
      paymentStatus: 'Pending',
    });
    
    await newAppointment.save();
    console.log(`[Appointment] Created new appointment: ${newAppointment._id}`);

    // 3) Block the slot on doctor
    const doctor = await Doctor.findById(bookedDoctor);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    doctor.bookedslots.push({ date: appointmentDate, time: appointmentTime });
    await doctor.save();
    console.log(`[Appointment] Updated doctor slots: ${doctor._id}`);

    // 4) If offline (Cash), notify the single admin
    if (paymentMethod === 'offline') {
      // Format the appointment date
      const fmtDate = new Date(appointmentDate)
        .toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

      // Look up patient name for a nicer message
      let patientName = "A patient";
      try {
        const patient = await User.findById(bookedPatient);
        if (patient?.name) {
          patientName = patient.name;
        }
      } catch (e) {
        console.warn("[Notification] Could not fetch patient name:", e.message);
      }

      const adminMessage = `New appointment request from ${patientName} on ${fmtDate} at ${appointmentTime}.`;

      // Fetch the admin account
      const admin = await Admin.findOne();
      console.log('[DEBUG] Admin lookup result:', admin ? `Found ID: ${admin._id}` : 'No admin found');
      
      if (!admin) {
        console.warn('[Notification] No admin account found to notify.');
      } else {
        try {
          console.log(`[Notification] About to notify admin: ${admin._id.toString()}`);
          
          const notif = await sendNotification(
            admin._id.toString(),
            adminMessage,
            'admin'
          );
          
          console.log('[Notification] Saved & emitted notification:', notif?._id || 'Failed');
        } catch (err) {
          console.error('[Notification] Error notifying admin:', err);
        }
      }
    }

    // 5) Return the appropriate response
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
    console.error('[Create Appointment Error]', error.stack);
    return res.status(500).json({
      message: "Server Error",
      error: error.message
    });
  }
};