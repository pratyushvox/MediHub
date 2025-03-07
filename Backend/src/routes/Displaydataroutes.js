import express from "express";
import { getDashboardStats } from "../controllers/Displaydatacontroller.js"

const router = express.Router();

// Route: GET /api/dashboard
router.get("/Displaydata", getDashboardStats);

export default router;
