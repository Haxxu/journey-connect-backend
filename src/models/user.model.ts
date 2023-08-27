import mongoose from 'mongoose';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';

import { IUser } from '@config/interface/user.interface';

type UserModel = mongoose.Model<IUser, {}, {}>;

const userSchema = new mongoose.Schema<IUser, UserModel, {}>(
	{
		username: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			trim: true,
		},
		first_name: { type: String, trim: true },
		last_name: { type: String, trim: true },
		birth_date: { type: Date },
		gender: { type: String, trim: true },
		work_places: [
			{
				name: {
					type: String,
				},
				start_year: {
					type: Number,
				},
				end_year: {
					type: Number,
				},
				_id: false,
			},
		],
		schools: [
			{
				name: {
					type: String,
				},
				start_year: {
					type: Number,
				},
				end_year: {
					type: Number,
				},
				_id: false,
			},
		],
		living_places: [
			{
				name: {
					type: String,
				},
				start_year: {
					type: Number,
				},
				end_year: {
					type: Number,
				},
				city: {
					type: String,
				},
				_id: false,
			},
		],
		friends: [
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
		blocked: {
			users: [
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
				},
			],
			groups: [
				{
					group: {
						type: mongoose.Schema.Types.ObjectId,
						ref: 'Group',
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
		joined_groups: [
			{
				group: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Group',
					required: true,
				},
				added: {
					type: Date,
					default: Date.now(),
				},
				type: { type: String, default: 'member' },
				_id: false,
			},
		],
		friend_requests: [
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
		add_friend_requests: [
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
		phone: {
			type: String,
		},
		country: {
			type: String,
		},
		registered_at: {
			type: Date,
			default: Date.now(),
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
		avatar: { type: String },
		background: { type: String },
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
	{ timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
