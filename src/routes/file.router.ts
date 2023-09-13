import fileController from '@controllers/file.controller';
import { Router } from 'express';
import multer from 'multer';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// [POST] => register user
router.post(
	'/files/upload-file',
	upload.single('file'),
	fileController.uploadFile
);

router.delete('/files/delete-file', fileController.deleteFile);

export default router;
