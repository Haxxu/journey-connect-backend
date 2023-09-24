import { Router } from 'express';

import postController from '@controllers/post.controller';
import emotionController from '@/controllers/emotion.controller';
import userAuth from '@/middlewares/user-auth.middleware';

const router = Router();

// [DELETE] => delete emotion
router.delete('/emotions/delete', [userAuth, emotionController.deleteEmotion]);

// [POST] => create emotion
router.post('/emotions', [userAuth, emotionController.createEmotion]);

// [GET] => get emotions
router.get('/emotions', [userAuth, emotionController.getEmotions]);

export default router;
