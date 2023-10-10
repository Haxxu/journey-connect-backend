import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import commentController from '@/controllers/comment.controller';

const router = Router();

// [POST] => create comment
router.post('/comments', [userAuth, commentController.createComment]);

// [GET] => get emotions
// router.get('/emotions', [userAuth, commentController.getEmotions]);

export default router;
