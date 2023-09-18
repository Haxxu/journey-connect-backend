import { Router } from 'express';

import meController from '@controllers/me.controller';
import userController from '@/controllers/user.controller';
import userAuth from '@/middlewares/user-auth.middleware';

const router = Router();

// [GET] => get user by id
router.get('/users/:id', [userAuth, userController.getUserById]);

// [PUT] => update user by id
router.put('/users/:id', [userAuth, userController.updateUserById]);

export default router;
