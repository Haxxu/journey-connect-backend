import { env } from '@/config/environment';
import { IReqAuth } from '@/config/interface/shared.interface';
import Comment from '@/models/comment.model';
import Emotion from '@/models/emotion.model';
import Post from '@/models/post.model';
import User from '@/models/user.model';
import ReportService from '@/services/report.service';
import ApiError from '@/utils/api-error';
import axios from 'axios';
import { createObjectCsvWriter } from 'csv-writer';
import { NextFunction, Response } from 'express';

function mapEmotionTypeToNumber(
	emotionType: string | undefined
): number | null {
	switch (emotionType) {
		case 'angry':
			return -2;
		case 'sad':
			return -1;
		case 'wow':
			return 1;
		case 'haha':
			return 2;
		case 'like':
		case 'heart':
			return 3;
		default:
			return null;
	}
}

class RecommendController {
	async generateRecommendationsCsv(
		req: IReqAuth,
		res: Response,
		next: NextFunction
	) {
		try {
			const posts = await Post.find().lean();
			const users = await User.find().lean();
			const emotions = await Emotion.find({
				context_type: 'post',
			}).lean();

			const data = emotions.map((emotion) => ({
				user_id: emotion?.owner.toString(),
				post_id: emotion.post.toString(),
				emotion_type: mapEmotionTypeToNumber(emotion?.type),
				timestamp: emotion.updatedAt,
			}));

			const csvWriter = createObjectCsvWriter({
				path: 'recommendations/emotions.csv',
				// header: [
				// 	{ id: 'user_id', title: '' },
				// 	{ id: 'post_id', title: 'Post ID' },
				// 	{ id: 'emotion_type', title: 'Emotion Type' },
				// 	{ id: 'timestamp', title: 'Timestamp' },
				// ],
				header: ['user_id', 'post_id', 'emotion_type', 'timestamp'],
			});

			await csvWriter.writeRecords(data);

			return res.status(200).json({
				success: true,
				message: 'Recommendations CSV generated successfully',
				data: 'recommendations/emotions.csv',
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}

	async trainingNewModel(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const response = await axios.post(`${env.recommendApiUrl}/train`);

			return res.status(200).json({
				success: true,
				message: 'Training recommend posts model successfully',
				data: null,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new RecommendController();
