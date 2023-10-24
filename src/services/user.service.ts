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

	static async getUsers(condition: any) {
		try {
			let search = condition.search as string;
			let page = condition.page as string;
			let pageSize = condition.pageSize as string;
			let createdStartDate = condition.createdStartDate as string;
			let createdEndDate = condition.createdEndDate as string;

			const query: any = {};
			if (search) {
				query.$or = [
					{ username: { $regex: new RegExp(search, 'i') } },
					{ email: { $regex: new RegExp(search, 'i') } },
					{ first_name: { $regex: new RegExp(search, 'i') } },
					{ last_name: { $regex: new RegExp(search, 'i') } },
				];
			}
			if (createdStartDate && createdEndDate) {
				query.createdAt = {
					$gte: new Date(createdStartDate),
					$lte: new Date(createdEndDate),
				};
			} else if (createdStartDate) {
				query.createdAt = { $gte: new Date(createdStartDate) };
			} else if (createdEndDate) {
				query.createdAt = { $lte: new Date(createdEndDate) };
			}

			const options = {
				page: parseInt(page, 10) || 1,
				limit: parseInt(pageSize, 10) || 10,
				sort: { createdAt: -1 },
				select: '-password',
			};

			const users = await User.paginate(query, options);

			return users;
		} catch (error) {
			console.error('Error get user documents:', error);
		}
	}
}

export default UserService;
