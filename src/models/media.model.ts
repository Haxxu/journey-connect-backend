import mongoose from 'mongoose';
import Joi from 'joi';

import { IMedia } from '@/config/interface/media.interface';

type MediaModel = mongoose.Model<IMedia, {}, {}>;

const mediaSchema = new mongoose.Schema<IMedia, MediaModel, {}>(
	{
		type: {
			type: String, // image, video, mp3, mp4?
			default: 'image',
		},
		original_name: {
			type: String,
		},
		path: {
			type: String,
			required: true,
		},
		url: {
			type: String,
			required: true,
		},
		size: {
			type: Number,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	},
	{ timestamps: true }
);

const Media = mongoose.model<IMedia>('Media', mediaSchema);

export default Media;
