import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import commentController from '@/controllers/comment.controller';

const router = Router();

// [POST] => create comment
router.post('/comments', [userAuth, commentController.createComment]);

// [PATCH] => update comment by id
router.patch('/comments/:id', [userAuth, commentController.updateCommentById]);

// [DELETE] => delete comment by id
router.delete('/comments/:id', [userAuth, commentController.deleteCommentById]);

// [GET] => get emotions
// router.get('/emotions', [userAuth, commentController.getEmotions]);

export default router;
