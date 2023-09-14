import { Request } from 'express';
import { Types } from 'mongoose';
import { IUser } from './user.interface';

export interface IUserAdded {
	user: string | Types.ObjectId;
	added_at: Date;
}

export interface IGroupAdded {
	group: string | Types.ObjectId;
	deleted_at?: Date;
	added_at: Date;
	type?: string; // member, admin
}

export interface IPostAdded {
	post: string | Types.ObjectId;
	added_at: Date;
}

export interface IEmotionAdded {
	emotion: string | Types.ObjectId;
	added_at: Date;
}

export interface ICommentAdded {
	comment: string | Types.ObjectId;
	added_at: Date;
}

export interface IShareAdded {
	user: string | Types.ObjectId;
	post: string | Types.ObjectId;
	added_at: Date;
}

export interface IFriendTag {
	user: string | Types.ObjectId;
	name: string;
}

export interface IPlaceAdded {
	place: string | Types.ObjectId;
	name?: string;
	added_at?: Date;
}

export interface IReqAuth extends Request {
	user?: IUser;
}
