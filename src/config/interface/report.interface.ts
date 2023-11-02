import { Types } from 'mongoose';

export interface IReport {
	types: any;
	reporter: string | Types.ObjectId;
	reported_user: string | Types.ObjectId;
	content: string;
	context_type: string;
	post: string | Types.ObjectId;
	comment: string | Types.ObjectId;
	status: 'pending' | 'accept' | 'decline';
	_doc: object;
}
