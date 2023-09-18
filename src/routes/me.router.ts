import { Router } from 'express';

import meController from '@controllers/me.controller';
import userAuth from '@/middlewares/user-auth.middleware';

const router = Router();

// [GET] => get me info
router.get('/me/info', [userAuth, meController.getInfo]);

// [PUT] => update me avatar, background
router.put('/me/update-image', [userAuth, meController.updateImage]);

export default router;
