import { Router } from 'express';

import postController from '@controllers/post.controller';
import userAuth from '@/middlewares/user-auth.middleware';
import adminAuth from '@/middlewares/admin-auth.middleware';

const router = Router();

// [GET] => get feed posts
router.get('/posts/feed', [userAuth, postController.getFeedPosts]);

// [GET] => get post info
router.get('/posts/info', [adminAuth, postController.getPostsInfo]);

// [GET] => get post base emotion
router.get('/posts/top-emotions', [
	adminAuth,
	postController.getPostsByEmotions,
]);

// [POST] => create post
router.post('/posts', [userAuth, postController.createPost]);

// [GET] => get post info
router.patch('/posts/:id/status', [adminAuth, postController.updatePostStatus]);

// [POST] => update post
router.put('/posts/:id', [userAuth, postController.updatePostById]);

// [POST] => delete post
router.delete('/posts/:id', [userAuth, postController.deletePostById]);

// [GET] => get posts by filter (admin)
router.get('/posts', [adminAuth, postController.getPosts]);

export default router;
