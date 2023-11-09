import { Document, Types } from 'mongoose';
import { IMedia } from './media.interface';
import {
	ICommentAdded,
	IEmotionAdded,
	IFriendTag,
	IPlaceAdded,
	IShareAdded,
} from './shared.interface';

export interface IBlocked {
	users: [{ user_id: string; blocked_at: Date }];
	groups: [{ group_id: string; blocked_at: Date }];
}

export interface IRelationship {
	relationship_id: string;
}

export interface IInnerPost {
	post_id: string;
}

export interface IPost extends Document {
	title: string;
	theme?: string;
	owner?: string | Types.ObjectId;
	inner_post?: string | Types.ObjectId;
	group?: string | Types.ObjectId;
	post_type: string; // group_post, individual_post, share_post
	visibility: string; // private_group, public_group, friend_only, public, private
	medias: any[];
	emotions: IEmotionAdded[];
	comments: ICommentAdded[];
	shares: IShareAdded[];
	friend_tags: IFriendTag[];
	places: IPlaceAdded[];
	createdAt?: any;
	updatedAt?: any;
	status?: 'active' | 'deactive';
	_doc: object;
}
