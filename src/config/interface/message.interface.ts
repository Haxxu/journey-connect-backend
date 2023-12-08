import { Document, Types } from 'mongoose';

export interface IMessage {
	content: string;
	owner: string | Types.ObjectId;
	chat: string | Types.ObjectId;
	_doc?: object;
}
