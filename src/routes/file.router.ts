import fileController from '@controllers/file.controller';
import { Router } from 'express';
import multer from 'multer';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// [POST] => register user
router.post(
	'/files/upload',
	upload.single('filename'),
	fileController.uploadFile
);

router.delete('/files/delete', fileController.deleteFile);

export default router;
