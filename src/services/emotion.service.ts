import Post from '@/models/post.model';
import Emotion from '@/models/emotion.model';

export interface IUpsertEmotion {
	type: string;
	context_id: string;
	context_type: string;
	emotion_date?: any;
	owner?: string;
}

export interface IDeleteEmotion {
	owner?: string;
	context_id: string;
	context_type: string;
}

class EmotionService {
	id?: string;

	constructor(id: string) {
		this.id = id;
	}

	static async upsertEmotion(payload: IUpsertEmotion) {
		const emotion = await Emotion.findOne({
			owner: payload.owner,
			context_type: payload.context_type,
			[payload.context_type]: payload.context_id,
		});
		if (emotion) {
			emotion.type = payload.type;
			emotion.emotion_date = payload.emotion_date;
			await emotion.save();
			return emotion;
		} else {
			const newEmotion = await new Emotion({
				owner: payload.owner,
				type: payload.type,
				[payload.context_type]: payload.context_id,
			}).save();
			return newEmotion;
		}
	}

	static async upsertEmotionInPost(emotionId: string, postId: string) {
		try {
			const post = await Post.findOne({ _id: postId });
			if (!post) {
				return null;
			} else {
				const emotionIndex = post.emotions.findIndex(
					(e) => e.emotion.toString() === emotionId
				);
				if (emotionIndex !== -1) {
					post.emotions[emotionIndex].added_at = new Date();
				} else {
					post.emotions.push({
						emotion: emotionId,
						added_at: new Date(),
					});
				}
				await post.save();
				return true;
			}
		} catch (error: any) {
			throw new Error(
				'Error fetching posts by user ID: ' + error.message
			);
		}
	}

	static async deleteEmotion(payload: IDeleteEmotion) {
		const emotion = await Emotion.findOneAndDelete({
			owner: payload.owner,
			context_type: payload.context_type,
			[payload.context_type]: payload.context_id,
		});

		return emotion;
	}

	static async deleteEmotionInPost(emotionId: string, postId: string) {
		try {
			const post = await Post.findOneAndUpdate(
				{ _id: postId },
				{
					$pull: { emotions: { emotion: emotionId } },
				},
				{ new: true }
			);

			return post;
		} catch (error: any) {
			throw new Error(
				'Error fetching posts by user ID: ' + error.message
			);
		}
	}

	static async getEmotions(context_type: string, context_id: string) {
		try {
			const emotions = await Emotion.find({
				context_type: context_type,
				[context_type]: context_id,
			})
				.sort({ emotion_date: -1 })
				.populate('owner', '_id first_name last_name avatar medias')
				.lean();

			const count: Record<string, number> = {
				all: emotions.length,
			};
			const types = ['like', 'wow', 'heart', 'haha', 'sad', 'angry'];

			types.forEach((type) => {
				const typeCount = emotions.filter(
					(emotion) => emotion.type === type
				).length;
				count[type] = typeCount;
			});

			return {
				emotions,
				count,
			};
		} catch (error: any) {
			throw new Error(
				'Error fetching posts by user ID: ' + error.message
			);
		}
	}
}

export default EmotionService;
