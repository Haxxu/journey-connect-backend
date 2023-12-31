import mongoose, { PaginateModel } from 'mongoose';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';
import mongoosePaginate from 'mongoose-paginate-v2';

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
		description: {
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
				city: {
					type: String,
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
				city: {
					type: String,
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
		sent_friend_requests: [
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
		received_friend_requests: [
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
			default: '',
		},
		country: {
			type: String,
			default: '',
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
				id: {
					type: String,
				},
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
		privacy: {
			work_places: {
				visibility: { type: String, default: 'private' },
			},
			schools: {
				visibility: { type: String, default: 'private' },
			},
			living_places: {
				visibility: { type: String, default: 'private' },
			},
			phone: {
				visibility: { type: String, default: 'private' },
			},
			birth_date: {
				visibility: { type: String, default: 'private' },
			},
		},
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
		role: {
			type: String,
			default: 'user', // admin
		},
		status: {
			type: String,
			default: 'active',
		},
	},
	{ timestamps: true }
);

userSchema.methods.generateAuthToken = function (): string {
	const token = jwt.sign(
		{
			_id: this._id,
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
		_id: this._id,
		email: this.email,
	});
};

userSchema.methods.generateRefreshToken = function (): string {
	return generateRefreshToken({
		_id: this._id,
		email: this.email,
	});
};

userSchema.plugin(mongoosePaginate);

const User = mongoose.model<IUser, UserModel & PaginateModel<IUser>>(
	'User',
	userSchema
);

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

export const validateUpdateUser = (user: IUser) => {
	const schema = Joi.object({
		username: Joi.string().trim(),
		description: Joi.string().trim(),
		first_name: Joi.string(),
		last_name: Joi.string(),
		birth_date: Joi.date().iso().max('now'),
		gender: Joi.string().trim().valid('male', 'female', 'other'),
		work_places: Joi.array().items(
			Joi.object({
				name: Joi.string().trim(),
				start_year: Joi.number().allow(null),
				end_year: Joi.number().allow(null),
				city: Joi.string().trim(),
			})
		),
		schools: Joi.array().items(
			Joi.object({
				name: Joi.string().trim(),
				start_year: Joi.number().allow(null),
				end_year: Joi.number().allow(null),
				city: Joi.string().trim(),
			})
		),
		living_places: Joi.array().items(
			Joi.object({
				name: Joi.string().trim(),
				start_year: Joi.number().allow(null),
				end_year: Joi.number().allow(null),
				city: Joi.string().trim(),
			})
		),
		phone: Joi.string().trim(),
		country: Joi.string().trim(),
	});

	return schema.validate(user);
};

export default User;
