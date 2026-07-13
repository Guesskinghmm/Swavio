import express from 'express';
import { sendMessage, getMessages, deleteChat } from '../controllers/messageController.js';
const router = express.Router();

router.post('/', sendMessage);
router.get('/:senderId/:receiverId', getMessages);
router.delete('/:userId/:receiverId', deleteChat);

export default router;
