import { Document } from 'mongoose';
import { IMedia } from './media.interface';
import { IUserAdded, IGroupAdded, IPostAdded } from './shared.interface';

export interface IWorkPlace {
	name: string;
	start_year?: number;
	end_year?: number;
	city?: string;
}

export interface ISchool {
	name: string;
	start_year?: number;
	end_year?: number;
	city?: string;
}

export interface ILivingPlace {
	name?: string;
	start_year?: number;
	end_year?: number;
	city?: string;
}

export interface IBlocked {
	users: [{ user_id: string; blocked_at: Date }];
	groups: [{ group_id: string; blocked_at: Date }];
}

export interface IRelationship {
	relationship_id: string;
}

export interface IUser extends Document {
	email?: string;
	description?: string;
	username?: string;
	password: string;
	first_name?: string;
	last_name?: string;
	birth_date?: Date;
	gender?: string;
	work_places?: IWorkPlace[];
	schools?: ISchool[];
	living_places?: ILivingPlace[];
	friends?: IUserAdded[];
	blocked?: IBlocked;
	joined_groups?: IGroupAdded[];
	sent_friend_requests?: IUserAdded[];
	received_friend_requests?: IUserAdded[];
	relationships?: IRelationship[];
	medias?: any[];
	phone?: string;
	country?: string;
	registered_at?: Date;
	avatar?: string;
	background?: string;
	posts?: IPostAdded[];
	refresh_token?: any;
	privacy?: any;
	createdAt?: any;
	updatedAt?: any;
	status: 'active' | 'deactive';
	role?: 'admin' | 'user';
	_doc?: object;
}

export interface IUserMethods {
	generateAuthToken(): string;
	generateAccessToken(): string;
	generateRefreshToken(): string;
}

export interface INewUser {
	first_name: string;
	last_name: string;
	email: string;
	password: string;
	gender: string;
	birth_date: Date;
}

export interface IDecodedActiveToken {
	id?: string;
	newUser?: INewUser;
	iat: number;
	exp: number;
}

export interface IDecodedResetPasswordToken {
	id?: string;
	email: string;
	iat: number;
	exp: number;
}

export interface IDecodedAuthToken {
	_id?: string;
	email?: string;
	iat: number;
	exp: number;
}
