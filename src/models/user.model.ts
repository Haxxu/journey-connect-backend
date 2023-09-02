import mongoose from 'mongoose';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';

import { IUser, IUserMethods } from '@configs/interface/user.interface';
import { env } from '@/config/environment';
import {
	generateAccessToken,
	generateRefreshToken,
} from '@/config/generate-token';

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
	{
		username: {
			type: String,
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
		first_name: { type: String, trim: true, required: true },
		last_name: { type: String, trim: true, required: true },
		birth_date: { type: Date, required: true },
		gender: { type: String, trim: true, required: true },
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
		refresh_token: [
			{
				token: {
					type: String,
					required: true,
				},
				created_at: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

userSchema.methods.generateAuthToken = function (): string {
	const token = jwt.sign(
		{
			id: this._id,
			email: this.email,
		},
		env.jwt_private_key as string,
		{
			expiresIn: '7d',
		}
	);

	return token;
};

userSchema.methods.generateAccessToken = function (): string {
	return generateAccessToken({
		id: this._id,
		email: this.email,
	});
};

userSchema.methods.generateRefreshToken = function (): string {
	return generateRefreshToken({
		id: this._id,
		email: this.email,
	});
};

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export const validateCreateUser = (user: IUser) => {
	const schema = Joi.object({
		email: Joi.string().email().required(),
		password: passwordComplexity().required(),
		first_name: Joi.string().required(),
		last_name: Joi.string().required(),
		birth_date: Joi.date().iso().max('now').required(),
		gender: Joi.string().trim().valid('male', 'female', 'other').required(),
	});

	return schema.validate(user);
};

export default User;
