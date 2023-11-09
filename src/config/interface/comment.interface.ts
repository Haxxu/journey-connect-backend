import { Document, Types } from 'mongoose';

export interface IComment extends Document {
	owner?: string | Types.ObjectId;
	context_id?: string | Types.ObjectId;
	context_owner?: string | Types.ObjectId;
	context_type?: string; // post
	post?: string | Types.ObjectId;
	content?: string;
	reply_comments?: any[];
	reply_user?: string | Types.ObjectId;
	root_comment?: string | Types.ObjectId;
	status: 'active' | 'deactive';
	_doc?: object;
}
