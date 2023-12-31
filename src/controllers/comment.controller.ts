import { Response, Request, NextFunction } from 'express';
import { IReqAuth } from '@/config/interface/shared.interface';
import ApiError from '@/utils/api-error';
import Comment, {
	validateCreateComment,
	validateReplyComment,
} from '@/models/comment.model';
import Post from '@/models/post.model';
import CommentService, {
	ICreateComment,
	ICreateReplyComment,
} from '@/services/comment.service';
import User from '@/models/user.model';
import { io } from '@/index';
import moment from 'moment';
import Report from '@/models/report.model';

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

			// Socket.io
			io.to(`${context_id}`).emit('createComment', comment);

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

	async replyComment(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const { error } = validateReplyComment(req.body);
			if (error) {
				return next(new ApiError(400, error.details[0].message));
			}

			const {
				content,
				context_id,
				context_type,
				root_comment,
				reply_user,
			} = req.body;

			let context;
			const payload = {
				content,
				context_type,
				context_id,
				context_owner: '',
				owner: req.user?._id,
				post: '',
				root_comment,
				reply_user,
			};

			if (context_type === 'post') {
				context = await Post.findOne({ _id: context_id });
				payload.post = context_id;
				payload.context_owner = context?.owner?.toString() || '';
			}
			if (!context) {
				return next(new ApiError(404, `${context_type} not found`));
			}

			const rootComment = await Comment.findOne({ _id: root_comment });
			if (!rootComment) {
				return next(new ApiError(404, 'Root comment not found'));
			}

			const replyUser = await User.findOne({ _id: reply_user });
			if (!replyUser) {
				return next(new ApiError(404, 'Reply user not found'));
			}

			const newReplyComment = await CommentService.createReplyComment(
				<ICreateReplyComment>payload
			);

			// Socket.io
			io.to(`${newReplyComment.context_id}`).emit(
				'replyComment',
				newReplyComment
			);

			return res.status(200).json({
				success: true,
				data: newReplyComment,
				message: 'Reply comment successfully',
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

			// Socket.io
			io.to(`${updated_comment?.context_id}`).emit(
				'updateComment',
				updated_comment
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

			await Report.deleteMany({
				context_type: 'comment',
				comment: deleted_comment?._id,
			});

			// Socket.io
			io.to(`${deleted_comment?.context_id}`).emit(
				'deleteComment',
				deleted_comment
			);

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

	async getComments(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const data = await Comment.aggregate([
				{
					$facet: {
						totalData: [
							{
								$match: {
									context_id: req.query.context_id as string,
									root_comment: { $exists: false },
									reply_user: { $exists: false },
								},
							},
							{
								$lookup: {
									from: 'users',
									let: { owner_id: '$owner' },
									pipeline: [
										{
											$project: {
												first_name: 1,
												last_name: 1,
												avatar: 1,
												medias: 1,
											},
										},
										{
											$match: {
												$expr: {
													$eq: ['$_id', '$$owner_id'],
												},
											},
										},
									],
									as: 'owner',
								},
							},
							{
								$unwind: '$owner',
							},
							{
								$lookup: {
									from: 'comments',
									let: { reply_cms: '$reply_comments' },
									pipeline: [
										{
											$match: {
												$expr: {
													$in: [
														'$_id',
														'$$reply_cms',
													],
												},
											},
										},
										{
											$lookup: {
												from: 'users',
												let: { owner_id: '$owner' },
												pipeline: [
													{
														$project: {
															first_name: 1,
															last_name: 1,
															avatar: 1,
															medias: 1,
														},
													},
													{
														$match: {
															$expr: {
																$eq: [
																	'$_id',
																	'$$owner_id',
																],
															},
														},
													},
												],
												as: 'owner',
											},
										},
										{ $unwind: '$owner' },
										{
											$lookup: {
												from: 'users',
												let: {
													reply_user_id:
														'$reply_user',
												},
												pipeline: [
													{
														$project: {
															first_name: 1,
															last_name: 1,
															avatar: 1,
															medias: 1,
														},
													},
													{
														$match: {
															$expr: {
																$eq: [
																	'$_id',
																	'$$reply_user_id',
																],
															},
														},
													},
												],
												as: 'reply_user',
											},
										},
										{ $unwind: '$reply_user' },
									],
									as: 'reply_comments',
								},
							},
							{ $sort: { createdAt: -1 } },
						],
						totalCount: [
							{
								$match: {
									context_id: req.query.context_id as string,
								},
							},
							{ $count: 'count' },
						],
					},
				},
				{
					$project: {
						totalData: 1,
						count: { $arrayElemAt: ['$totalCount.count', 0] },
					},
				},
			]);

			return res.status(200).json({
				success: true,
				data: {
					comments: data[0].totalData,
					totalComments: data[0].count,
				},
				message: 'Get comments successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getCommentsByFilter(
		req: IReqAuth,
		res: Response,
		next: NextFunction
	) {
		try {
			const comments = await CommentService.getComments(req.query);

			return res.status(200).json({
				success: true,
				message: 'Get comments successfully',
				data: comments,
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}

	async getCommentsInfo(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const now = new Date();
			const oneWeekAgo = new Date(
				now.getTime() - 7 * 24 * 60 * 60 * 1000
			);

			// Count total comments
			const totalComments = await Comment.countDocuments();

			// Count reply comments
			const totalReplyComments = await Comment.countDocuments({
				reply_user: { $exists: true },
			});

			// Count normal comments (excluding reply comments)
			const totalNormalComments = totalComments - totalReplyComments;

			// Count comments created since last week
			const commentsSinceLastWeek = await Comment.countDocuments({
				createdAt: { $gte: oneWeekAgo },
			});

			// Count reply comments created since last week
			const replyCommentsSinceLastWeek = await Comment.countDocuments({
				reply_user: { $exists: true },
				createdAt: { $gte: oneWeekAgo },
			});

			// Count normal comments created since last week
			const normalCommentsSinceLastWeek =
				commentsSinceLastWeek - replyCommentsSinceLastWeek;

			const monthData = [];
			for (let i = 0; i < 5; i++) {
				// Show data for the past 5 months, including the current month
				const startOfMonth = moment()
					.subtract(i, 'months')
					.startOf('month');
				const endOfMonth = moment()
					.subtract(i, 'months')
					.endOf('month');

				const monthCount = await Comment.countDocuments({
					createdAt: {
						$gte: startOfMonth,
						$lte: endOfMonth.toDate(),
					},
				});

				const monthName = startOfMonth.format('MMMM'); // Format the month name in English

				// Count reply comments for each month
				const replyCommentsCount = await Comment.countDocuments({
					reply_user: { $exists: true },
					createdAt: {
						$gte: startOfMonth,
						$lte: endOfMonth.toDate(),
					},
				});

				// Count normal comments for each month (excluding reply comments)
				const normalCommentsCount = monthCount - replyCommentsCount;

				monthData.unshift({
					month: monthName,
					total: monthCount,
					normal_comments: normalCommentsCount,
					reply_comments: replyCommentsCount,
				});
			}

			// Format data for response
			const responseData = {
				comments: {
					total: totalComments,
					sinceLastWeek: commentsSinceLastWeek,
				},
				normalComments: {
					total: totalNormalComments,
					sinceLastWeek: normalCommentsSinceLastWeek,
				},
				replyComments: {
					total: totalReplyComments,
					sinceLastWeek: replyCommentsSinceLastWeek,
				},
				commentsCreatedEachMonth: monthData,
			};

			return res.status(200).json({
				success: true,
				message: 'Admin dashboard comments data retrieved successfully',
				data: responseData,
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}
}

export default new CommentController();
