import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import commentController from '@/controllers/comment.controller';
import adminAuth from '@/middlewares/admin-auth.middleware';
import chatController from '@/controllers/chat.controller';

const router = Router();

// [GET] => get messages from chat
router.get('/chat', [userAuth, chatController.getOrCreateChat]);

export default router;
