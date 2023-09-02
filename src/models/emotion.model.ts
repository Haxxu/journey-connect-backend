import mongoose from 'mongoose';
import Joi from 'joi';

import { IEmontion } from '@configs/interface/emotion.interface';

type EmotionModel = mongoose.Model<IEmontion, {}, {}>;

const emotionSchema = new mongoose.Schema<IEmontion, EmotionModel, {}>(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String, // like, love, hear, smile, sad, angry
		},
		context_type: {
			type: String,
			default: 'post',
		},
		post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
		emotion_date: { type: Date },
	},
	{ timestamps: true }
);

const Emotion = mongoose.model<IEmontion>('Emotion', emotionSchema);

export default Emotion;
