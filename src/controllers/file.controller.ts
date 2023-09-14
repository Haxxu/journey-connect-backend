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
import Media from '@/models/media.model';
import { IReqAuth } from '@/config/interface/shared.interface';
import MediaService from '@/services/media.service';

interface MulterRequest extends Request {
	file: any;
}

class FileController {
	async uploadFile(req: any, res: Response, next: NextFunction) {
		try {
			const newMedia = new Media({ owner: req.user._id });
			const original_name = req.file.originalname;
			const dateTime = giveCurrentDateTime();
			const path = `files/${newMedia._id}_${original_name}_${dateTime}`;

			const storageRef = ref(storage, path);
			const fileSize = req.file.buffer.byteLength;

			const metadata = {
				contentType: req.file.mimetype,
			};

			const snapshot = await uploadBytesResumable(
				storageRef,
				req.file.buffer,
				metadata
			);

			const url = await getDownloadURL(snapshot.ref);

			newMedia.path = path;
			newMedia.url = url;
			newMedia.size = fileSize;

			const savedMedia = await newMedia.save();

			return res.status(200).json(
				ApiResPayload(
					{
						media: {
							url,
							id: savedMedia._id,
							type: savedMedia.type,
							action: 'add',
						},
					},
					true,
					'Upload file success.'
				)
			);
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async deleteFile(req: any, res: Response, next: NextFunction) {
		try {
			const media = await Media.findOne({ _id: req.body.id });
			if (!media) {
				return res.status(404).json({
					success: false,
					data: null,
					message: 'Media not found.',
				});
			}

			if (media?.verified) {
				return res.status(200).json(
					ApiResPayload(
						{
							media: {
								type: media.type,
								id: media._id,
								url: media.url,
								action: 'remove',
							},
						},
						true,
						'File deleted successfully.'
					)
				);
			}

			await MediaService.deleteFiles([req.body.id], req.user?._id);

			return res.status(200).json(
				ApiResPayload(
					{
						media: null,
					},
					true,
					'File deleted successfully.'
				)
			);
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
