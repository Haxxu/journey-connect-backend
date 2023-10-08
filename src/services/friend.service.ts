import User from '@/models/user.model';
import mongoose from 'mongoose';

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
				data: null,
			};
		} catch (error: any) {
			console.error('Error add friend:', error);
			throw new Error('Error add friend.');
		}
	}

	static async unfriend(ownerId: string, userId: string) {
		try {
			const session = mongoose.startSession();
			(await session).startTransaction();

			await User.findOneAndUpdate(
				{ _id: ownerId },
				{ $pull: { friends: { user: userId } } }
			);

			await User.findOneAndUpdate(
				{ _id: userId },
				{ $pull: { friends: { user: ownerId } } }
			);

			(await session).commitTransaction();

			(await session).endSession();
		} catch (error: any) {
			console.error('Error unfriend requests.', error);
			throw new Error('Error unfriend requests.');
		}
	}

	static async cancelFriendRequest(ownerId: string, userId: string) {
		try {
			const session = mongoose.startSession();
			(await session).startTransaction();

			await User.findOneAndUpdate(
				{ _id: ownerId },
				{ $pull: { sent_friend_requests: { user: userId } } }
			);

			await User.findOneAndUpdate(
				{ _id: userId },
				{ $pull: { received_friend_requests: { user: ownerId } } }
			);

			(await session).commitTransaction();

			(await session).endSession();
		} catch (error: any) {
			console.error('Error cancel friend request.', error);
			throw new Error('Error cancel friend request.');
		}
	}

	static async getSentFriendRequests(userId: string) {
		try {
			const user = await User.findOne({ _id: userId })
				.populate(
					'sent_friend_requests.user',
					'_id first_name last_name avatar medias'
				)
				.lean();
			return user;
		} catch (error: any) {
			console.error('Error get sent friend requests.', error);
			throw new Error('Error get sent friend requests.');
		}
	}

	static async getReceivedFriendRequestsInfo(userId: string) {
		try {
			const user = await User.findOne({ _id: userId })
				.populate(
					'received_friend_requests.user',
					'_id first_name last_name avatar medias friends'
				)
				.lean();

			return { received_friend_requests: user?.received_friend_requests };
		} catch (error: any) {
			console.error('Error get received friend requests.', error);
			throw new Error('Error get received friend requests.');
		}
	}

	static async getMutualFriends(
		meFriends: string[] = [],
		userFriends: string[] = []
	) {
		try {
			const mutual_friends = meFriends.filter((id) =>
				userFriends.includes(id)
			);
			const mutualFriends = await User.find({
				_id: { $in: mutual_friends },
			}).select('_id first_name last_name avatar medias friends');

			return mutualFriends;
		} catch (error) {
			console.error('Error get mutual friends', error);
			throw new Error('Error get mutual friends');
		}
	}

	static async validateFriendRequest(
		ownerId: string,
		userId: string,
		type: string
	) {
		try {
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
					message: 'Validate friend not found',
					data: null,
				};
			}

			// Already friend
			if (
				owner.friends
					?.map((item) => item.user.toString())
					.includes(userId)
			) {
				return {
					success: false,
					message: 'You and user already friend.',
					data: null,
				};
			}

			if (
				!owner.received_friend_requests
					?.map((item) => item.user.toString())
					.includes(userId) ||
				!user.sent_friend_requests
					?.map((item) => item.user.toString())
					.includes(ownerId)
			) {
				return {
					success: false,
					message: 'Friend request not found',
					data: null,
				};
			}

			if (type === 'accept') {
				const addedDate = new Date();
				owner.friends?.push({
					user: userId,
					added_at: addedDate,
				});
				user.friends?.push({
					user: ownerId,
					added_at: addedDate,
				});
				owner.received_friend_requests =
					owner.received_friend_requests.filter(
						(item) => item.user.toString() !== userId
					);
				user.sent_friend_requests = user.sent_friend_requests?.filter(
					(item) => item.user.toString() !== ownerId
				);
			} else if (type === 'decline') {
				owner.received_friend_requests =
					owner.received_friend_requests.filter(
						(item) => item.user.toString() !== userId
					);
				user.sent_friend_requests = user.sent_friend_requests?.filter(
					(item) => item.user.toString() !== ownerId
				);
			}

			await owner.save();
			await user.save();

			return {
				success: true,
				message: 'Validate friend request successfully',
				data: null,
			};
		} catch (error) {
			console.error('Error validate friend request.', error);
			throw new Error('Error validate friend request.');
		}
	}
}

export default FriendService;
