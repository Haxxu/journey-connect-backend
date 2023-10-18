import { Request, Response, NextFunction } from 'express';

import ApiError from '@/utils/api-error';
import { IReqAuth } from '@/config/interface/shared.interface';
import PostService from '@/services/post.service';
import MediaService from '@/services/media.service';
import User, { validateUpdateUser } from '@/models/user.model';

class UserController {
	async getUserById(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			let selectOption = '';
			if (req.user?._id === req.params.id) {
				selectOption = '-password -refresh_token';
			} else {
				selectOption =
					'-password -refresh_token -blocked -friend_requests -add_friend_requests';
			}

			const user = await User.findOne({ _id: req.params.id })
				.select(selectOption)
				.lean();
			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'User not found',
					data: null,
				});
			}

			if (req.user?._id !== user?._id.toString()) {
				if (user.privacy?.work_places?.visibility === 'private') {
					user.work_places = undefined;
				}
				if (user.privacy?.schools?.visibility === 'private') {
					user.schools = undefined;
				}
				if (user.privacy?.living_places?.visibility === 'private') {
					user.living_places = undefined;
				}
				if (user.privacy?.phone?.visibility === 'private') {
					user.phone = undefined;
				}
				if (user.privacy?.birth_date?.visibility === 'private') {
					user.birth_date = undefined;
				}
			}

			return res.status(200).json({
				success: true,
				message: 'Get user successfully',
				data: user,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async updateUserById(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			if (req.params.id !== req.user?._id) {
				return next(
					new ApiError(
						403,
						"You don't have permission to perform this action."
					)
				);
			}

			const { error } = validateUpdateUser(req.body);
			if (error) {
				return res.status(400).json({
					success: false,
					message: 'Validation error',
					error: error.details,
					data: null,
				});
			}

			const userId = req.params.id;
			const updateFields = req.body;

			const updatedUser = await User.findByIdAndUpdate(
				userId,
				{ $set: updateFields },
				{ new: true, lean: true }
			);

			if (!updatedUser) {
				return res.status(404).json({
					success: false,
					message: 'User not found',
					data: null,
				});
			}

			return res.status(200).json({
				success: true,
				message: 'User updated successfully',
				data: {
					...updatedUser,
					password: undefined,
					refresh_token: undefined,
				},
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}

	async searchUsers(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const query = (req.query?.query as string).trim();

			if (!query) {
				return res.status(200).json({
					success: true,
					message: 'Search query is empty',
					data: [],
				});
			}

			const users = await User.find({
				$or: [
					{ username: { $regex: query, $options: 'i' } },
					{ email: { $regex: query, $options: 'i' } },
					{ first_name: { $regex: query, $options: 'i' } },
					{ last_name: { $regex: query, $options: 'i' } },
					{ 'work_places.name': { $regex: query, $options: 'i' } },
					{ 'schools.name': { $regex: query, $options: 'i' } },
					{ 'living_places.name': { $regex: query, $options: 'i' } },
				],
			}).select('_id first_name last_name avatar medias');

			return res.status(200).json({
				success: true,
				message: 'Search users successfully',
				data: users,
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}
}

export default new UserController();
