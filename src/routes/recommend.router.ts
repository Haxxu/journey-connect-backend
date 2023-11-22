import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import reportController from '@/controllers/report.controller';
import adminAuth from '@/middlewares/admin-auth.middleware';
import recommendController from '@/controllers/recommend.controller';
import postController from '@/controllers/post.controller';

const router = Router();

// [GET] => get recommend post
router.get('/recommend/posts', [userAuth, postController.getRecommendPosts]);

// [POST] => report
router.post('/recommend', [
	adminAuth,
	recommendController.generateRecommendationsCsv,
]);

export default router;
