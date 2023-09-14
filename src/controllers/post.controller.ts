import { Request, Response, NextFunction } from 'express';

import Post, { validateCreatePost } from '@/models/post.model';
import ApiError from '@/utils/api-error';
import { IReqAuth } from '@/config/interface/shared.interface';
import PostService from '@/services/post.service';
import MediaService from '@/services/media.service';

class PostController {
	async createPost(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const { error } = validateCreatePost(req.body);
			if (error) {
				return next(new ApiError(400, error.details[0].message));
			}

			const addMediaIds = req.body.medias.map((item: any) => item.id);
			await MediaService.verifyFiles(addMediaIds, req.user?._id);

			req.body.owner = req.user?._id;
			const newPost = await PostService.createNewPost(req.body);

			return res.status(200).json({
				success: true,
				message: 'Create post successfully',
				data: newPost,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async deletePostById(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const post = await Post.findOne({ _id: req.params.id });
			if (!post) {
				return res.status(404).json({
					success: false,
					message: 'Post not found',
					data: null,
				});
			}

			const mediaIds = post.medias.map((item: any) => item.id);

			await Post.deleteOne({ _id: req.params.id });

			await MediaService.deleteFiles(mediaIds, req.user?._id);

			return res.status(200).json({
				success: true,
				message: 'Delete post successfully',
				data: null,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new PostController();
