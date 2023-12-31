import { Types } from 'mongoose';

export interface IMedia {
	type: string;
	url: string;
	path?: string;
	original_name?: string;
	size?: number;
	verified?: boolean;
	owner?: Types.ObjectId | string;
	id?: Types.ObjectId | string;
}
