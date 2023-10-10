import { Response, Request, NextFunction } from 'express';
import { IReqAuth } from '@/config/interface/shared.interface';
import ApiError from '@/utils/api-error';
import Comment, { validateCreateComment } from '@/models/comment.model';
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
				context_owner: '',
				owner: req.user?._id,
				post: '',
			};

			if (context_type === 'post') {
				context = await Post.findOne({ _id: context_id });
				payload.post = context_id;
				payload.context_owner = context?.owner?.toString() || '';
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

	async updateCommentById(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const { content } = req.body;

			const comment = await Comment.findOne({ _id: req.params.id });
			if (!comment) {
				return next(new ApiError(404, 'Comment not found'));
			}

			if (req.user?._id !== comment.owner?.toString()) {
				return next(
					new ApiError(
						403,
						'You dont have permission to update this comment'
					)
				);
			}

			const updated_comment = await CommentService.updateCommentById(
				req.params.id,
				req.user?._id,
				content
			);

			return res.status(200).json({
				success: true,
				data: updated_comment,
				message: 'Update comment successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async deleteCommentById(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const comment = await Comment.findOne({ _id: req.params.id });
			if (!comment) {
				return next(new ApiError(404, 'Comment not found'));
			}

			if (
				req.user?._id !== comment.owner?.toString() &&
				req.user?._id !== comment.context_owner?.toString()
			) {
				return next(
					new ApiError(
						403,
						'You dont have permission to update this comment'
					)
				);
			}

			const deleted_comment = await Comment.findOneAndDelete({
				_id: req.params.id,
			});

			if (deleted_comment?.root_comment) {
				await Comment.findOneAndUpdate(
					{
						_id: deleted_comment.root_comment,
					},
					{
						$pull: {
							reply_comments: deleted_comment._id,
						},
					}
				);
			} else {
				await Comment.deleteMany({
					_id: { $in: deleted_comment?.reply_comments },
				});
			}

			return res.status(200).json({
				success: true,
				data: deleted_comment,
				message: 'Delete comment successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new CommentController();
