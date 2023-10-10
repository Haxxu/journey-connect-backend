import { Response, Request, NextFunction } from 'express';
import { IReqAuth } from '@/config/interface/shared.interface';
import ApiError from '@/utils/api-error';
import { validateCreateComment } from '@/models/comment.model';
import Post from '@/models/post.model';
import CommentService, { ICreateComment } from '@/services/comment.service';

class CommentController {
	async createComment(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const { error } = validateCreateComment(req.body);
			if (error) {
				return next(new ApiError(400, error.details[0].message));
			}

			const { content, context_id, context_type } = req.body;

			let context;
			const payload = {
				content,
				context_type,
				context_id,
				owner: req.user?._id,
				post: '',
			};

			if (context_type === 'post') {
				context = await Post.findOne({ _id: context_id });
				payload.post = context_id;
			}

			if (!context) {
				return next(new ApiError(404, `${context_type} not found`));
			}

			const comment = await CommentService.createComment(
				<ICreateComment>payload
			);

			return res.status(200).json({
				success: true,
				data: comment,
				message: 'Create comment successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new CommentController();
