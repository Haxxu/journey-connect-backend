import { IReqAuth } from '@/config/interface/shared.interface';
import Comment from '@/models/comment.model';
import Emotion from '@/models/emotion.model';
import Post from '@/models/post.model';
import User from '@/models/user.model';
import ReportService from '@/services/report.service';
import ApiError from '@/utils/api-error';
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

			const mergedData = posts.map((post) => {
				const user = users.find(
					(u) => u._id.toString() === post.owner?.toString()
				);
				const emotion = emotions.find(
					(e) => e.post.toString() === post._id.toString()
				);
				const emotionTypeNumber = mapEmotionTypeToNumber(emotion?.type);
				return {
					user_id: user?._id.toString(),
					post_id: post._id,
					emotion_type: emotionTypeNumber,
					timestamp: post.createdAt,
				};
			});

			const csvWriter = createObjectCsvWriter({
				path: 'recommendations/emotions.csv',
				header: [
					{ id: 'user_id', title: 'User ID' },
					{ id: 'post_id', title: 'Post ID' },
					{ id: 'emotion_type', title: 'Emotion Type' },
					{ id: 'timestamp', title: 'Timestamp' },
				],
			});

			await csvWriter.writeRecords(mergedData);

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
}

export default new RecommendController();