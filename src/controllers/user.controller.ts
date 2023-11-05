import mongoosePaginate from 'mongoose-paginate-v2';
import { Request, Response, NextFunction } from 'express';

import ApiError from '@/utils/api-error';
import { IReqAuth } from '@/config/interface/shared.interface';
import PostService from '@/services/post.service';
import MediaService from '@/services/media.service';
import User, { validateUpdateUser } from '@/models/user.model';
import UserService from '@/services/user.service';
import moment from 'moment';
import mongoose from 'mongoose';

type AgeGroups = {
	'0-9': number;
	'10-19': number;
	'20-29': number;
	'30-39': number;
	'40-49': number;
	'50-59': number;
	'60+': number;
};

type AgeGroupInfo = {
	count: number;
	percentage: any;
};

// Define a type for ageGroupPercentages
type AgeGroupPercentages = { [key: string]: string | AgeGroupInfo };

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

	async getUsersInfo(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			// Calculate the user created per week, month, and total
			const now = new Date();
			const oneWeekAgo = new Date(
				now.getTime() - 7 * 24 * 60 * 60 * 1000
			);
			const oneMonthAgo = new Date(
				now.getTime() - 30 * 24 * 60 * 60 * 1000
			);

			const usersPerWeek = await User.countDocuments({
				registered_at: { $gte: oneWeekAgo },
			});
			const usersPerMonth = await User.countDocuments({
				registered_at: { $gte: oneMonthAgo },
			});
			const totalUsers = await User.countDocuments();

			// Count active and inactive users
			const activeUsers = await User.countDocuments({
				status: 'active',
			});
			const inactiveUsers = await User.countDocuments({
				status: 'deactive',
			});

			// Count users by gender
			const genderCounts = await User.aggregate([
				{ $group: { _id: '$gender', count: { $sum: 1 } } },
			]);

			// Count users by birth_date (you may need to adjust this based on your specific requirements)
			const birthDateCounts = await User.aggregate([
				{
					$group: {
						_id: { $year: '$birth_date' },
						count: { $sum: 1 },
					},
				},
			]);

			// Calculate age group percentages
			const ageGroups: AgeGroups = {
				'0-9': 0,
				'10-19': 0,
				'20-29': 0,
				'30-39': 0,
				'40-49': 0,
				'50-59': 0,
				'60+': 0,
			};

			// Calculate age and update ageGroups
			birthDateCounts.forEach((entry) => {
				const birthYear = entry._id;
				const age = now.getFullYear() - birthYear;

				if (age < 10) {
					ageGroups['0-9'] += entry.count;
				} else if (age < 20) {
					ageGroups['10-19'] += entry.count;
				} else if (age < 30) {
					ageGroups['20-29'] += entry.count;
				} else if (age < 40) {
					ageGroups['30-39'] += entry.count;
				} else if (age < 50) {
					ageGroups['40-49'] += entry.count;
				} else if (age < 60) {
					ageGroups['50-59'] += entry.count;
				} else {
					ageGroups['60+'] += entry.count;
				}
			});

			// Calculate percentages
			const ageGroupPercentages: AgeGroupPercentages = {};
			for (const [group, count] of Object.entries(ageGroups)) {
				ageGroupPercentages[group] = {
					percentage: ((count / totalUsers) * 100).toFixed(2) + '%',
					count: count,
				};
			}

			const weekData = [];
			for (let i = 0; i < 4; i++) {
				// Show data for the past 4 weeks
				const startOfWeek = new Date(
					now.getTime() - (i * 7 + 7) * 24 * 60 * 60 * 1000
				);
				const endOfWeek = new Date(
					now.getTime() - i * 7 * 24 * 60 * 60 * 1000
				);

				const weekCount = await User.countDocuments({
					registered_at: { $gte: startOfWeek, $lte: endOfWeek },
				});

				weekData.push({
					week: `-${i + 1} week`,
					count: weekCount,
				});
			}

			const monthData = [];
			for (let i = 0; i < 5; i++) {
				// Show data for the past 5 months, including the current month
				const startOfMonth = moment()
					.subtract(i, 'months')
					.startOf('month');
				const endOfMonth = moment()
					.subtract(i, 'months')
					.endOf('month');

				const monthCount = await User.countDocuments({
					registered_at: {
						$gte: startOfMonth,
						$lte: endOfMonth.toDate(),
					},
				});

				const monthName = startOfMonth.format('MMMM'); // Format the month name in English
				monthData.unshift({
					month: monthName,
					count: monthCount,
				});
			}

			// Format data for response
			const responseData = {
				userCreated: {
					week: weekData,
					month: monthData,
					total: totalUsers,
				},
				userStatus: {
					active: activeUsers,
					deactive: inactiveUsers,
				},
				userGender: genderCounts,
				userBirthDate: birthDateCounts,
				ageGroupPercentages,
			};

			return res.status(200).json({
				success: true,
				message: 'Admin dashboard data retrieved successfully',
				data: responseData,
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}

	async getUsers(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const users = await UserService.getUsers(req.query);

			return res.status(200).json({
				success: true,
				message: 'Get users successfully',
				data: users,
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}

	async deactiveUser(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const user = await User.findOne({ _id: req.body.user });
			if (!user) {
				return next(new ApiError(404, 'User not found'));
			}

			let password = user.password;

			if (password[0] !== '!') {
				password = '!' + password;
			}

			await User.findByIdAndUpdate(req.body.user, {
				password: password,
				status: 'deactive',
			});

			return res.status(200).json({
				success: true,
				message: 'Deactive user successfully',
				data: null,
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}

	async activeUser(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const user = await User.findOne({ _id: req.body.user });
			if (!user) {
				return next(new ApiError(404, 'User not found'));
			}

			let password = user.password;

			if (password[0] === '!') {
				password = password.slice(1);
			}

			await User.findByIdAndUpdate(req.body.user, {
				password: password,
				status: 'active',
			});

			return res.status(200).json({
				success: true,
				message: 'Active user successfully',
				data: null,
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}

	async getUserFriendsById(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const userId = req.params.id;
			const user = await User.findById(userId);

			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'User not found',
					data: null,
				});
			}

			const userFriends = await User.find({
				_id: {
					$in: user?.friends?.map((friend) => friend.user.toString()),
				},
			}).select('_id medias first_name last_name avatar friends');

			const currentUserFriends = await User.find({
				_id: {
					$in: req.user?.friends?.map((friend) =>
						friend.user.toString()
					),
				},
			}).select('_id medias first_name last_name avatar friends');

			const userFriendsWithMutual = userFriends.map((userFriend) => {
				const mutualFriends = currentUserFriends.filter(
					(currentUserFriend) =>
						userFriend?.friends?.some((friend) =>
							new mongoose.Types.ObjectId(friend.user).equals(
								currentUserFriend._id
							)
						)
				);
				return {
					user: userFriend,
					mutualFriends: mutualFriends,
				};
			});

			return res.status(200).json({
				success: true,
				message: 'Get user friends successfully',
				data: userFriendsWithMutual,
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}
}

export default new UserController();
