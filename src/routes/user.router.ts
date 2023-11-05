import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import meController from '@controllers/me.controller';
import userController from '@/controllers/user.controller';
import postController from '@/controllers/post.controller';
import adminAuth from '@/middlewares/admin-auth.middleware';

const router = Router();

// [GET] => search user
router.get('/users/search', [userAuth, userController.searchUsers]);

// [GET] => get user info (dashboard admin chart)
router.get('/users/info', [adminAuth, userController.getUsersInfo]);

// [GET] => get user friend by user id
router.get('/users/:id/friends', [userAuth, userController.getUserFriendsById]);

// [GET] => get posts by user id
router.get('/users/:id/posts', [userAuth, postController.getPostsByUserId]);

// [GET] => get user by id
router.get('/users/:id', [userAuth, userController.getUserById]);

// [PUT] => update user role by id
router.put('/users/:id/role', [adminAuth, userController.updateUserById]);

// [PUT] => update user by id
router.put('/users/:id', [userAuth, userController.updateUserById]);

// [POST] => deactive user
router.post('/users/deactive', [adminAuth, userController.deactiveUser]);

// [POST] => active user
router.post('/users/active', [adminAuth, userController.activeUser]);

// [GET] => get user by filter (admin)
router.get('/users', [adminAuth, userController.getUsers]);

export default router;
