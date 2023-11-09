import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import reportController from '@/controllers/report.controller';
import adminAuth from '@/middlewares/admin-auth.middleware';

const router = Router();

// [POST] => report
router.post('/reports', [userAuth, reportController.report]);

// [GET] => get report
router.get('/reports', [adminAuth, reportController.getReports]);

export default router;
