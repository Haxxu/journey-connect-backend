import authController from '@controllers/auth.controller';
import { Router } from 'express';

const router = Router();

// [POST] => register user
router.post('/auth/register', authController.register);

export default router;
