import { Document, Types } from 'mongoose';

export interface IContext {
	type: string; // post, tour, comment
	id: string;
	owner: Types.ObjectId;
}

export interface IEmotion extends Document {
	owner: string | Types.ObjectId;
	type: string;
	context_type: string;
	post: string | Types.ObjectId;
	emotion_date: Date;
	_doc: object;
}
