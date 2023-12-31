import { Router } from 'express';

import authController from '@controllers/auth.controller';

const router = Router();

// [POST] => register user
router.post('/auth/register', authController.register);

// [POST] => login
router.post('/auth/login', authController.login);

// [POST] => active user
router.post('/auth/active', authController.active);

// [POST] => active user
router.post('/auth/forgot-password', authController.forgotPassword);

// [POST] => active user
router.post('/auth/reset-password', authController.resetPassword);

export default router;
