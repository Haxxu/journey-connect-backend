import { IReqAuth } from '@/config/interface/shared.interface';
import User from '@/models/user.model';
import FriendService from '@/services/friend.service';
import ApiError from '@/utils/api-error';
import { fa } from '@faker-js/faker';
import { NextFunction, Response } from 'express';

class FriendController {
	async checkIsFriend(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const friends = req.user?.friends?.map((friend) =>
				friend.user.toString()
			);

			const users = req.body?.users.map((userId: string) =>
				friends?.includes(userId)
			);

			return res.status(200).json({
				success: true,
				message: 'Check friends successfully',
				data: { users },
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getMyFriends(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const user = await User.findOne({ _id: req.user?._id })
				.populate(
					'friends.user',
					'_id first_name last_name avatar medias'
				)
				.exec();

			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'User not found',
					data: null,
				});
			}

			return res.status(200).json({
				success: true,
				message: 'Get friends successfully',
				data: user?.friends,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async addFriend(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const results = await FriendService.addFriend(
				req.user?._id,
				req.body.user
			);

			return res.status(results.success ? 200 : 400).json({
				...results,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getSentFriendRequests(
		req: IReqAuth,
		res: Response,
		next: NextFunction
	) {
		try {
			const user = await FriendService.getSentFriendRequests(
				req.user?._id
			);
			if (!user) {
				return res.status(404).json({
					success: false,
					data: null,
					message: 'User not found',
				});
			}

			return res.status(200).json({
				success: true,
				data: user.sent_friend_requests,
				message: 'Get sent friend requests successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getReceivedFriendRequests(
		req: IReqAuth,
		res: Response,
		next: NextFunction
	) {
		try {
			let { received_friend_requests } =
				await FriendService.getReceivedFriendRequestsInfo(
					req.user?._id
				);

			return res.status(200).json({
				success: true,
				data: { received_friend_requests },
				message: 'Get received friend requests successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async validateFriendRequest(
		req: IReqAuth,
		res: Response,
		next: NextFunction
	) {
		try {
			const result = await FriendService.validateFriendRequest(
				req.user?._id,
				req.body.user,
				req.body.type
			);
			return res.status(result.success ? 200 : 400).json(result);
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async unfriend(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			await FriendService.unfriend(req.user?._id, req.body.user);

			return res.status(200).json({
				success: true,
				data: null,
				message: 'Unfriend successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getMutualFriends(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const user = await User.findOne({ _id: req.query?.userId });

			const mutual_friends = await FriendService.getMutualFriends(
				req.user?.friends?.map((item) => item.user.toString()),
				user?.friends?.map((item) => item.user.toString())
			);

			return res.status(200).json({
				success: true,
				data: { mutual_friends },
				message: 'Get mutual friends successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new FriendController();
