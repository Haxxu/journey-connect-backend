import Comment from '@/models/comment.model';

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
}

export default CommentService;