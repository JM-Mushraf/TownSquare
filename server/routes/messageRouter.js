import express from 'express'
import { isAuthenticated } from '../middlewares/auth.js';
import { fetchMessages, sendMessage } from '../controllers/messageController.js';
import { upload } from '../middlewares/multer.js';
import { getChatMembers } from '../controllers/chatController.js';
export const MessageRouter=express.Router();



MessageRouter.post('/send',isAuthenticated,upload.fields([{ 
    name: 'attachments', 
    maxCount: 5 // Allows up to 5 files per message
  }]),sendMessage);
MessageRouter.get('/all/:chatId',isAuthenticated,fetchMessages)
MessageRouter.get('/members/:chatId',isAuthenticated,getChatMembers)