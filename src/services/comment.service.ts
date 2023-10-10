import Comment from '@/models/comment.model';

export interface ICreateComment {
	content: string;
	context_type: string;
	context_id: string;
	post?: string;
	owner: string;
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
}

export default CommentService;
