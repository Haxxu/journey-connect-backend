import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import commentController from '@/controllers/comment.controller';
import adminAuth from '@/middlewares/admin-auth.middleware';
import chatController from '@/controllers/chat.controller';

const router = Router();

// [PUT] => update message
router.put('/messages/:id', [userAuth, chatController.editMessage]);

// [DELETE] => delete message
router.delete('/messages/:id', [userAuth, chatController.deleteMessage]);

// [POST] => create message
router.post('/messages', [userAuth, chatController.addMessageToChat]);

export default router;
