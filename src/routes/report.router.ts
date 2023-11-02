import { Router } from 'express';

import userAuth from '@/middlewares/user-auth.middleware';
import reportController from '@/controllers/report.controller';

const router = Router();

// [POST] => report
router.post('/reports', [userAuth, reportController.report]);

export default router;
