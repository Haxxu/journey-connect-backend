import { Request, Response, NextFunction } from 'express';

import { validateCreatePost } from '@/models/post.model';
import ApiError from '@/utils/api-error';

class PostController {
	async createPost(req: Request, res: Response, next: NextFunction) {
		try {
			const { error } = validateCreatePost(req.body);
			if (error) {
				return next(new ApiError(400, error.details[0].message));
			}
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new PostController();
