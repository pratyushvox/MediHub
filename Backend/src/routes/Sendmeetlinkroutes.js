import express from 'express';
import { sendMeetLink } from '../controllers/Sendmeetlinkcontroller.js'

const router = express.Router();

// POST /api/email/send-meet-link
router.post('/send-meet-link', sendMeetLink);

// POST /api/email/send-confirmation (if needed)


export default router;