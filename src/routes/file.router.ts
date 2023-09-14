import { Router } from 'express';
import multer from 'multer';

import fileController from '@controllers/file.controller';
import userAuth from '@/middlewares/user-auth.middleware';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// [POST] => upload file
router.post('/files/upload-file', [
	userAuth,
	upload.single('file'),
	fileController.uploadFile,
]);

// [DELETE] => delete file
router.delete('/files/delete-file', [userAuth, fileController.deleteFile]);

export default router;
