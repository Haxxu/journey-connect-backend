import User from '@/models/user.model';

class UserService {
	id?: string;

	constructor(id: string) {
		this.id = id;
	}

	static async findOne(condition: object) {
		return await User.findOne(condition);
	}

	static async createNewUser(payload: object) {
		const newUser = await new User(payload).save();
		newUser.password = '';
		newUser.__v = undefined;
		const access_token = newUser.generateAccessToken();
		return {
			new_user: newUser,
			access_token,
		};
	}
}

export default UserService;
