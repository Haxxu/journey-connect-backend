import { Request, Response, NextFunction } from 'express';

import ApiError from '@/utils/api-error';
import { IReqAuth } from '@/config/interface/shared.interface';
import PostService from '@/services/post.service';
import MediaService from '@/services/media.service';
import User from '@/models/user.model';

class MeController {
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
					console.log('hello');
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
}

export default new MeController();
