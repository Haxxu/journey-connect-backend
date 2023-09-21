import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import meController from '@controllers/me.controller';
import userController from '@/controllers/user.controller';
import postController from '@/controllers/post.controller';

const router = Router();

// [GET] => get posts by user id
router.get('/users/:id/posts', [userAuth, postController.getPostsByUserId]);

// [GET] => get user by id
router.get('/users/:id', [userAuth, userController.getUserById]);

// [PUT] => update user by id
router.put('/users/:id', [userAuth, userController.updateUserById]);

export default router;
