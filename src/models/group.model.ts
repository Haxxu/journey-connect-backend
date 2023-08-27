import mongoose from 'mongoose';
import Joi from 'joi';

import { IGroup } from '@config/interface/group.interface';

type GroupModel = mongoose.Model<IGroup, {}, {}>;

const groupSchema = new mongoose.Schema<IGroup, GroupModel, {}>(
	{
		name: {
			type: String,
			trim: true,
			required: true,
		},
		description: {
			type: String,
			trim: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		medias: [
			{
				type: {
					type: String,
					trim: true,
				},
				url: { type: String, trim: true },
				_id: false,
			},
		],
		avatar: {
			type: String,
			trim: true,
			required: true,
		},
		background: {
			type: String,
			trim: true,
		},
		visibility: {
			type: String,
			required: true,
			default: 'private', // private, public
		},
		posts: [
			{
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
		pinned_posts: [
			{
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
		moderation: {
			is_moderate: {
				type: Boolean,
				default: false,
			},
			posts: [
				{
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
		},
		admins: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				added_at: {
					type: Date,
					default: Date.now(),
				},
				_id: false,
			},
		],
		members: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'User',
					required: true,
				},
				added_at: {
					type: Date,
					default: Date.now(),
				},
				type: { type: String, default: 'member' },
				_id: false,
			},
		],
	},
	{ timestamps: true }
);

const Group = mongoose.model<IGroup>('Group', groupSchema);

export default Group;
