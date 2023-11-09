import mongoose from 'mongoose';
import Joi from 'joi';

import { IComment } from '@configs/interface/comment.interface';

type CommentModel = mongoose.Model<IComment, {}, {}>;

const commentSchema = new mongoose.Schema<IComment, CommentModel, {}>(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		context_id: {
			type: String,
		},
		context_owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		context_type: {
			type: String,
			default: 'post',
		},
		content: {
			type: String,
			required: true,
		},
		post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
		root_comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
		reply_comments: [
			{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
		],
		reply_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		status: {
			type: String,
			default: 'active',
		},
	},
	{ timestamps: true }
);

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export const validateCreateComment = (comment: IComment) => {
	const schema = Joi.object({
		context_type: Joi.string().default('post'),
		context_id: Joi.string(),
		content: Joi.string().required(),
	});

	return schema.validate(comment);
};

export const validateReplyComment = (comment: IComment) => {
	const schema = Joi.object({
		context_id: Joi.string().required(),
		context_type: Joi.string().default('post'),
		content: Joi.string().required(),
		root_comment: Joi.string().required(),
		reply_user: Joi.string().required(),
	});

	return schema.validate(comment);
};

export default Comment;
