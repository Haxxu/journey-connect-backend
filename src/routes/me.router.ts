import { Router } from 'express';

import meController from '@controllers/me.controller';
import userAuth from '@/middlewares/user-auth.middleware';

const router = Router();

// [GET] => get me info
router.get('/me/info', [userAuth, meController.getInfo]);

export default router;
