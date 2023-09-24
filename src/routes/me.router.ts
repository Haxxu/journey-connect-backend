import { Router } from 'express';

import meController from '@controllers/me.controller';
import userAuth from '@/middlewares/user-auth.middleware';
import emotionController from '@/controllers/emotion.controller';

const router = Router();

// [GET] => get me info
router.get('/me/info', [userAuth, meController.getInfo]);

// [GET] => get posts
router.get('/me/posts', [userAuth, meController.getPosts]);

// [PUT] => update me avatar, background
router.put('/me/update-image', [userAuth, meController.updateImage]);

// [GET] => get me emotion
router.get('/me/emotions', [userAuth, emotionController.getMyEmotion]);

export default router;
