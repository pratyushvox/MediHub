import express from 'express';
import { createChat, getChats, getMessages, sendMessage } from '../../controllers/Chat/Chatcontroller.js';
const router = express.Router();

// initialize or retrieve a chat between two participants
router.post('/', createChat);  // Changed from '/chats' to '/'

// get all chats for a user by userId
router.get('/:recipientId', getChats);  // Changed from '/chats/:userId' to '/:recipientId'

// get all messages for a chat
router.get('/:chatId/messages', getMessages);  // Changed from '/chats/:chatId/messages' to '/:chatId/messages'

// post a new message to a chat
router.post('/:chatId/messages', sendMessage);  // Changed from '/chats/:chatId/messages' to '/:chatId/messages'

export default router;