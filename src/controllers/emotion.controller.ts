import { IReqAuth } from '@/config/interface/shared.interface';
import Emotion, {
	validateCreateEmotion,
	validateDeleteEmotion,
} from '@/models/emotion.model';
import Post from '@/models/post.model';
import ApiError from '@/utils/api-error';
import { NextFunction, Response } from 'express';
import EmotionService, {
	IDeleteEmotion,
	IUpsertEmotion,
} from '@/services/emotion.service';

class EmotionController {
	async createEmotion(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const { error } = validateCreateEmotion(req.body);
			if (error) {
				return next(new ApiError(400, error.details[0].message));
			}

			const emotion = await EmotionService.upsertEmotion(<IUpsertEmotion>{
				...req.body,
				emotion_date: Date.now(),
				owner: req.user?._id,
			});

			if (req.body.context_type === 'post') {
				let isSuccess = await EmotionService.upsertEmotionInPost(
					emotion._id.toString(),
					req.body.context_id
				);
				if (!isSuccess) {
					return res.status(404).json({
						success: false,
						message: 'Post not found',
						data: null,
					});
				}
			}

			return res.status(200).json({
				success: true,
				message: 'Create emotion successfully',
				data: {
					emotion: emotion,
				},
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async deleteEmotion(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			console.log('delete');

			const { error } = validateDeleteEmotion(req.body);
			if (error) {
				return next(
					new ApiError(
						400,
						'Delete emotion failed. ' + error.details[0].message
					)
				);
			}

			const emotion = await EmotionService.deleteEmotion(<IDeleteEmotion>{
				...req.body,
				owner: req.user?._id,
			});
			if (!emotion) {
				return res.status(404).json({
					success: false,
					message: 'Delete emotion failed. Emotion not found',
					data: null,
				});
			}

			if (req.body.context_type === 'post') {
				console.log('delet post');

				let isSuccess = await EmotionService.deleteEmotionInPost(
					emotion._id.toString(),
					req.body.context_id
				);
				if (!isSuccess) {
					return res.status(404).json({
						success: false,
						message: 'Delete emotion failed. Post not found',
						data: null,
					});
				}
			}

			return res.status(200).json({
				success: true,
				message: 'Delete emotion successfully',
				data: {
					emotion: emotion,
				},
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getEmotions(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const context_id = req.query.context_id as string;
			let context_type = 'post';
			if (req.query.context_type === 'post') {
				context_type = 'post';
			}
			const result = await EmotionService.getEmotions(
				context_type,
				context_id
			);

			return res.status(200).json({
				success: true,
				message: 'Get emotions successfully',
				data: { emotions: result?.emotions, count: result?.count },
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getMyEmotion(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			let context_id = req.query.context_id as string;
			let context_type = 'post';
			if (req.query.context_type === 'post') {
				context_type = 'post';
			}

			const emotion = await Emotion.findOne({
				owner: req.user?._id,
				context_type,
				[context_type]: context_id,
			});

			return res.status(200).json({
				success: true,
				message: 'Get my emotion successfully',
				data: { emotion },
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new EmotionController();
