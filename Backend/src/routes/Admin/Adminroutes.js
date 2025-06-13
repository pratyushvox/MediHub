import express from "express";
import { createAdmin, adminLogin } from "../../controllers/Admin/Admincontroller.js";

const router = express.Router();

// Route to create the admin account (only for first-time setup)
router.post("/admin/create", createAdmin);

// Route to handle admin login
router.post("/admin/login", adminLogin);

export default router;
