// routes/chatRoutes.js

import express from 'express';
import {
  createChat,
  getChats,
  getMessages,
  sendMessage
} from '../../controllers/Chat/Chatcontroller.js';

const router = express.Router();

// Create or fetch a chat
router.post('/', createChat);

// **Specific** must come before catch-all
router.get('/:chatId/messages', getMessages);
router.post('/:chatId/messages', sendMessage);

// Then the “list all chats for a user” route
router.get('/:recipientId', getChats);

export default router;
