import { Types } from 'mongoose';

export interface IReport {
	reporter: string | Types.ObjectId;
	reported_user: string | Types.ObjectId;
	content: string;
	context_type: string;
	post: string | Types.ObjectId;
	comment: string | Types.ObjectId;
	_doc: object;
}
