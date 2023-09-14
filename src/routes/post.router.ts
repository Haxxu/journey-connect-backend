import { Router } from 'express';

import postController from '@controllers/post.controller';

const router = Router();

// [POST] => create post
router.post('/posts', postController.createPost);

// [POST] => update post
router.put('/posts/:id', postController.createPost);

// [POST] => delete post
router.delete('/post/:id', postController.createPost);

export default router;
