import express from "express";

import { editAppointment } from "../../controllers/Appointment/EditAppointmentController.js";
import { deleteAppointment } from "../../controllers/Appointment/DeleteAppointmentController.js";
import { getAppointments } from "../../controllers/Appointment/GetAppointmentController.js";
import { createAppointment } from "../../controllers/Appointment/CreateAppointmentController.js";
import { updateAppointmentStatus } from "../../controllers/Appointment/Updateappointmentcontroller.js";

const router = express.Router();

router.post("/appointments/createAppointment", createAppointment);
router.put("/appointments/editAppointment", editAppointment);
router.delete("/appointments/reject/:id", deleteAppointment);
router.get("/appointments/getAppointment", getAppointments);
router.put("/appointments/:appointmentId/status", updateAppointmentStatus);



export default router;