import mongoose from 'mongoose';
import Joi from 'joi';

import { IPost } from '@configs/interface/post.interface';

type PostModel = mongoose.Model<IPost, {}, {}>;

const postSchema = new mongoose.Schema<IPost, PostModel, {}>(
	{
		title: {
			type: String,
			trim: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		group: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Group',
		},
		inner_post: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post',
		},
		medias: [
			{
				type: {
					type: String,
					trim: true,
				},
				url: { type: String, trim: true },
				id: {
					type: String,
				},
				_id: false,
			},
		],
		post_type: {
			type: String,
			default: 'individual_post', // group_post, share_post, individual_post
		},
		visibility: {
			type: String,
			default: 'public', // private_group, public_group, friend_only, public, private
		},
		emotions: [
			{
				emotion: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Emotion',
					required: true,
				},
				added_at: {
					type: Date,
					default: Date.now(),
				},
				_id: false,
			},
		],
		comments: [
			{
				comment: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Comment',
					required: true,
				},
				added_at: {
					type: Date,
					default: Date.now(),
				},
				_id: false,
			},
		],
		shares: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				post: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Post',
					required: true,
				},
				added_at: {
					type: Date,
					default: Date.now(),
				},
				_id: false,
			},
		],
		friend_tags: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				text: {
					type: String,
					trim: true,
				},
				_id: false,
			},
		],
		places: [
			{
				place: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Place',
					required: true,
				},
				added_at: {
					type: Date,
					default: Date.now(),
				},
				text: {
					type: String,
					trim: true,
				},
				_id: false,
			},
		],
		theme: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Post = mongoose.model<IPost>('Post', postSchema);

export const validateCreatePost = (post: IPost) => {
	const schema = Joi.object({
		title: Joi.string().required(),
		visibility: Joi.string()
			.valid(
				'private_group',
				'public_group',
				'friend_only',
				'public',
				'private'
			)
			.required(),
		post_type: Joi.string()
			.valid('group_post', 'share_post', 'individual_post', '')
			.required(),
	});

	return schema.validate(post);
};

export default Post;
