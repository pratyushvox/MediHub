import Appointment from "../../models/Appointment/AppointmentModel.js";
export const getAppointments = async (req, res) => {
    try {
      const appointments = await Appointment.find().populate("bookedPatient bookedDoctor payment");
      // Remove the trailing spaces after field names
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };


  

