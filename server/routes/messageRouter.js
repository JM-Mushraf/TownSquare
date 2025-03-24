import express from 'express'
import { isAuthenticated } from '../middlewares/auth.js';
import { fetchMessages, sendMessage } from '../controllers/messageController.js';
export const MessageRouter=express.Router();



MessageRouter.post('/send',isAuthenticated,sendMessage);
MessageRouter.get('/all/:chatId',isAuthenticated,fetchMessages)