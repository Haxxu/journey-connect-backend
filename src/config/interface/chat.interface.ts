import { Document, Types } from 'mongoose';

export interface IChat extends Document {
	users: string[] | Types.ObjectId[];
	messages: IMessage[];
	_doc?: object;
}

export interface IMessage {
	message: string | Types.ObjectId;
	added_at: any;
}
