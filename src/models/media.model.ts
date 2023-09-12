import mongoose from 'mongoose';
import Joi from 'joi';

import { IMedia } from '@/config/interface/media.interface';

type MediaModel = mongoose.Model<IMedia, {}, {}>;

const mediaSchema = new mongoose.Schema<IMedia, MediaModel, {}>(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String, // image, video, mp3, mp4?
			default: 'image',
		},
		signature: {
			type: String,
		},
		url: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Media = mongoose.model<IMedia>('Media', mediaSchema);

export default Media;
