import { Types } from 'mongoose';

export interface IMedia {
	type: string;
	url: string;
	signature?: string;
	owner?: string | Types.ObjectId;
}
