import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import commentController from '@/controllers/comment.controller';
import adminAuth from '@/middlewares/admin-auth.middleware';

const router = Router();

// [GET] => get comments info
router.get('/comments/info', [adminAuth, commentController.getCommentsInfo]);

// [POST] => reply comment
router.post('/comments/reply', [userAuth, commentController.replyComment]);

// [POST] => create comment
router.post('/comments', [userAuth, commentController.createComment]);

// [PATCH] => update comment by id
router.patch('/comments/:id', [userAuth, commentController.updateCommentById]);

// [DELETE] => delete comment by id
router.delete('/comments/:id', [userAuth, commentController.deleteCommentById]);

router.get('/comments/all', [adminAuth, commentController.getCommentsByFilter]);

// [GET] => get comments ?context_id
router.get('/comments', [userAuth, commentController.getComments]);

export default router;
