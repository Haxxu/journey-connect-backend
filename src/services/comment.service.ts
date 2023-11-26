import Comment from '@/models/comment.model';
import Emotion from '@/models/emotion.model';
import User from '@/models/user.model';

export interface ICreateComment {
	content: string;
	context_type: string;
	context_id: string;
	context_owner: string;
	post?: string;
	owner: string;
}

export interface ICreateReplyComment {
	content: string;
	context_type: string;
	context_id: string;
	context_owner: string;
	post?: string;
	owner: string;
	root_comment: string;
	reply_user: string;
}

class CommentService {
	id?: string;

	constructor(id: string) {
		this.id = id;
	}

	static async findOne(condition: object) {
		return await Comment.findOne(condition);
	}

	static async createComment(payload: ICreateComment) {
		try {
			const new_comment = await new Comment(payload).save();

			(
				await new_comment.populate(
					'owner',
					'_id avatar medias first_name last_name'
				)
			).save();

			return new_comment;
		} catch (error: any) {
			console.error('Error add friend:', error);
			throw new Error('Error add friend.');
		}
	}

	static async createReplyComment(payload: ICreateReplyComment) {
		try {
			const new_comment = await new Comment(payload).save();

			await Comment.findOneAndUpdate(
				{ _id: payload.root_comment },
				{
					$push: { reply_comments: new_comment._id },
				}
			);

			(
				await new_comment.populate([
					{
						path: 'owner',
						select: '_id first_name last_name avatar medias',
					},
					{
						path: 'reply_user',
						select: '_id first_name last_name avatar medias',
					},
				])
			).save();

			return new_comment;
		} catch (error: any) {
			console.error('Error add friend:', error);
			throw new Error('Error add friend.');
		}
	}

	static async updateCommentById(
		commentId: string,
		ownerId: string,
		content: string
	) {
		try {
			const updated_comment = await Comment.findOneAndUpdate(
				{
					_id: commentId,
					owner: ownerId,
				},
				{ content },
				{ new: true }
			);

			(
				await updated_comment?.populate(
					'owner',
					'_id first_name last_name avatar medias'
				)
			)?.save();

			return updated_comment;
		} catch (error: any) {
			console.error('Error add friend:', error);
			throw new Error('Error add friend.');
		}
	}

	static async getComments(condition: any) {
		try {
			let search = condition.search as string;
			let page = condition.page as string;
			let pageSize = condition.pageSize as string;

			const query: any = {};

			if (search) {
				query.$or = [
					{ content: { $regex: new RegExp(search, 'i') } },
					{
						owner: {
							$in: await User.find({
								$or: [
									{
										first_name: {
											$regex: new RegExp(search, 'i'),
										},
									},
									{
										last_name: {
											$regex: new RegExp(search, 'i'),
										},
									},
									{
										email: {
											$regex: new RegExp(search, 'i'),
										},
									},
								],
							}).distinct('_id'),
						},
					},
				];
			}

			const options = {
				page: parseInt(page, 10) || 1,
				limit: parseInt(pageSize, 10) || 10,
				sort: { createdAt: -1 },
				populate: [
					{
						path: 'owner',
						select: '_id first_name avatar last_name medias',
					},
					{
						path: 'context_owner',
						select: '_id first_name avatar last_name medias',
					},
					{
						path: 'reply_user',
						select: '_id first_name avatar last_name medias',
					},
					{
						path: 'root_comment',
						populate: [
							{
								path: 'owner',
								select: '_id first_name last_name avatar medias',
							},
							{
								path: 'context_owner',
								select: '_id first_name avatar last_name medias',
							},
							{
								path: 'reply_user',
								select: '_id first_name avatar last_name medias',
							},
						],
					},
					// Add any other populations you need
				],
			};

			const comments = await Comment.paginate(query, options);

			let length = comments.docs?.length || 0;

			for (let i = 0; i < length; ++i) {
				const emotions = await Emotion.find({
					comment: comments.docs[i]._id,
				});

				const emotionInfo = {
					total: emotions.length,
					sad: emotions.filter((emotion) => emotion.type === 'sad')
						.length,
					like: emotions.filter((emotion) => emotion.type === 'like')
						.length,
					heart: emotions.filter(
						(emotion) => emotion.type === 'heart'
					).length,
					wow: emotions.filter((emotion) => emotion.type === 'wow')
						.length,
					haha: emotions.filter((emotion) => emotion.type === 'haha')
						.length,
					angry: emotions.filter(
						(emotion) => emotion.type === 'angry'
					).length,
				};

				comments.docs[i].emotionInfo = emotionInfo;
			}

			const responseData = {
				...comments,
				docs: comments.docs.map((comment) => ({
					...comment.toObject(),
					emotionInfo: comment.emotionInfo,
				})),
			};

			return responseData;
		} catch (error) {
			console.error('Error getting comment documents:', error);
		}
	}
}

export default CommentService;
