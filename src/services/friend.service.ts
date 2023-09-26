import User from '@/models/user.model';

class FriendService {
	id?: string;

	constructor(id: string) {
		this.id = id;
	}

	static async addFriend(ownerId: string, userId: string) {
		try {
			const addedDate = new Date();
			const owner = await User.findOne({ _id: ownerId });
			if (!owner) {
				return {
					success: false,
					message: 'User not found',
					data: null,
				};
			}

			const user = await User.findOne({ _id: userId });
			if (!user) {
				return {
					success: false,
					message: 'Request friend not found',
					data: null,
				};
			}

			if (
				owner?.friends
					?.map((item) => item.user.toString())
					.includes(userId)
			) {
				return {
					success: false,
					message: 'You and user is already friend.',
					data: null,
				};
			}
			if (
				owner?.sent_friend_requests
					?.map((item) => item.user.toString())
					.includes(userId)
			) {
				return {
					success: false,
					message: 'You already sent friend request',
					data: null,
				};
			}
			if (
				owner?.received_friend_requests
					?.map((item) => item.user.toString())
					.includes(userId)
			) {
				return {
					success: false,
					message: 'You already received friend request',
					data: null,
				};
			}

			owner?.sent_friend_requests?.unshift({
				user: userId,
				added_at: addedDate,
			});
			user?.received_friend_requests?.unshift({
				user: ownerId,
				added_at: addedDate,
			});
			await owner.save();
			await user.save();
			return {
				success: true,
				message: 'Sent friend request successfully',
			};
		} catch (error: any) {
			console.error('Error add friend:', error);
			throw new Error('Error add friend.');
		}
	}
}

export default FriendService;
