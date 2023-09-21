import { Request, Response, NextFunction } from 'express';

import ApiError from '@/utils/api-error';
import { IReqAuth } from '@/config/interface/shared.interface';
import PostService from '@/services/post.service';
import MediaService from '@/services/media.service';
import User from '@/models/user.model';
import Post from '@/models/post.model';

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

	async updateImage(req: IReqAuth, res: Response, next: NextFunction) {
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

			if (req.query?.type === 'background') {
				if (user.background) {
					const deletedFiles = await MediaService.deleteFiles(
						[user.background],
						req.user?._id
					);
					user.medias = user.medias?.filter(
						(media) => !deletedFiles?.includes(media?.id)
					);
				}
				await MediaService.verifyFiles(
					[req.body.media.id],
					req.user?._id
				);
				user.medias?.push(req.body.media);
				user.background = req.body.media.id;
			} else if (req.query?.type === 'avatar') {
				if (user.avatar) {
					const deletedFiles = await MediaService.deleteFiles(
						[user.avatar],
						req.user?._id
					);
					user.medias = user.medias?.filter(
						(media) => !deletedFiles?.includes(media?.id)
					);
				}
				await MediaService.verifyFiles(
					[req.body.media.id],
					req.user?._id
				);
				user.medias?.push(req.body.media);
				user.avatar = req.body.media.id;
			}

			await user.save();

			return res.status(200).json({
				success: true,
				message: `Update ${req.query.type || 'image'} successfully`,
				data: user,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getPosts(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const posts = await Post.find({ owner: req.user?._id })
				.populate('owner', '_id first_name last_name avatar medias')
				.sort({
					createdAt: -1,
				});

			return res.status(200).json({
				success: true,
				message: 'Get posts successfully',
				data: posts,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new MeController();
