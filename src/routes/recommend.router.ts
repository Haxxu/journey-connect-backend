import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import reportController from '@/controllers/report.controller';
import adminAuth from '@/middlewares/admin-auth.middleware';
import recommendController from '@/controllers/recommend.controller';

const router = Router();

// [POST] => report
router.post('/recommend', [
	adminAuth,
	recommendController.generateRecommendationsCsv,
]);

export default router;
