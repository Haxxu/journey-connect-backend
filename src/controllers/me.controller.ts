import { Request, Response, NextFunction } from 'express';

import ApiError from '@/utils/api-error';
import { IReqAuth } from '@/config/interface/shared.interface';
import PostService from '@/services/post.service';
import MediaService from '@/services/media.service';
import User from '@/models/user.model';

class MeController {
	async getInfo(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const user = await User.findOne({ _id: req.user?._id }).select(
				'-password -refresh_token'
			);

			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'User not found',
					data: null,
				});
			}

			return res.status(200).json({
				success: true,
				message: 'Get info successfully',
				data: user,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new MeController();
