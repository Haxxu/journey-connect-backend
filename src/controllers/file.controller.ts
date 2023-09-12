import {
	ref,
	getDownloadURL,
	uploadBytesResumable,
	deleteObject,
} from 'firebase/storage';

import { storage } from '@/database/firebase';
import { NextFunction, Request, Response } from 'express';
import ApiError from '@/utils/api-error';
import { ApiResPayload } from '@/utils/api';

interface MulterRequest extends Request {
	file: any;
}

class FileController {
	async uploadFile(req: any, res: Response, next: NextFunction) {
		try {
			const dateTime = giveCurrentDateTime();

			const storageRef = ref(
				storage,
				`files/${
					req.file.originalname +
					'-' +
					dateTime +
					'-' +
					generateRandomId()
				}`
			);

			const metadata = {
				contentType: req.file.mimetype,
			};

			const snapshot = await uploadBytesResumable(
				storageRef,
				req.file.buffer,
				metadata
			);

			const downloadUrl = await getDownloadURL(snapshot.ref);

			return res
				.status(200)
				.json(
					ApiResPayload(
						{ url: downloadUrl, type: 'image', signature: 'id' },
						true,
						'Upload file success.'
					)
				);
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async deleteFile(req: Request, res: Response, next: NextFunction) {
		try {
			const fileUrl = req.body.fileUrl;

			const fileRef = ref(storage, fileUrl);

			await deleteObject(fileRef);

			return res
				.status(200)
				.json(ApiResPayload({}, true, 'File deleted successfully.'));
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}
}

const giveCurrentDateTime = () => {
	const today = new Date();
	const date =
		today.getFullYear() +
		'-' +
		(today.getMonth() + 1) +
		'-' +
		today.getDate();
	const time =
		today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
	const dateTime = date + ' ' + time;
	return dateTime;
};

function generateRandomId(length = 10) {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let randomId = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		randomId += characters.charAt(randomIndex);
	}
	return randomId;
}

export default new FileController();
