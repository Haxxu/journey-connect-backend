import { Document, Types } from 'mongoose';
import { IPostAdded, IUserAdded } from './shared.interface';
import { IMedia } from './media.interface';

export interface IMember extends IUserAdded {
	muted_to?: Date;
	type?: string; // member, admin
}

export interface IModeration {
	is_moderate: boolean;
	posts: IPostAdded[];
}

export interface IGroup extends Document {
	owner: string | Types.ObjectId;
	admins: IUserAdded[];
	members: IMember[];
	name: string;
	description: string;
	visibility: string;
	rules: string[];
	pinned_posts: IPostAdded[];
	posts: IPostAdded[];
	moderation: IModeration;
	avatar: string;
	background: string;
	medias: IMedia[];
	_doc: object;
}
