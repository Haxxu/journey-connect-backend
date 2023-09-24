import mongoose from 'mongoose';
import Joi from 'joi';

import { IEmotion } from '@configs/interface/emotion.interface';

type EmotionModel = mongoose.Model<IEmotion, {}, {}>;

const emotionSchema = new mongoose.Schema<IEmotion, EmotionModel, {}>(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		type: {
			type: String, // like, love, heart, smile, sad, angry
			default: 'none',
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

const Emotion = mongoose.model<IEmotion>('Emotion', emotionSchema);

export const validateCreateEmotion = (emotion: IEmotion) => {
	const schema = Joi.object({
		type: Joi.string().valid(
			'like',
			'love',
			'heart',
			'smile',
			'sad',
			'angry',
			'none'
		),
		context_type: Joi.string().valid('post'),
		context_id: Joi.string(),
	});

	return schema.validate(emotion);
};
export const validateDeleteEmotion = (emotion: IEmotion) => {
	const schema = Joi.object({
		context_type: Joi.string().valid('post'),
		context_id: Joi.string(),
	});

	return schema.validate(emotion);
};

export default Emotion;
