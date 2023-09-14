import { Router } from 'express';
import multer from 'multer';

import fileController from '@controllers/file.controller';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

// [POST] => upload file
router.post(
	'/files/upload-file',
	upload.single('file'),
	fileController.uploadFile
);

// [DELETE] => delete file
router.delete('/files/delete-file', fileController.deleteFile);

export default router;
