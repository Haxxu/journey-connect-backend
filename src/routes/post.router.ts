import { Router } from 'express';

import postController from '@controllers/post.controller';
import userAuth from '@/middlewares/user-auth.middleware';

const router = Router();

// [GET] => get feed posts
router.get('/posts/feed', [userAuth, postController.getFeedPosts]);

// [POST] => create post
router.post('/posts', [userAuth, postController.createPost]);

// [POST] => update post
router.put('/posts/:id', [userAuth, postController.updatePostById]);

// [POST] => delete post
router.delete('/posts/:id', [userAuth, postController.deletePostById]);

export default router;
