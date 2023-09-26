import { Router } from 'express';

import meController from '@controllers/me.controller';
import userAuth from '@/middlewares/user-auth.middleware';
import emotionController from '@/controllers/emotion.controller';
import friendController from '@/controllers/friend.controller';

const router = Router();

export default router;
