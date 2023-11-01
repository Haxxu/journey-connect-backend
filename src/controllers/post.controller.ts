import { Request, Response, NextFunction } from 'express';

import Post, { validateCreatePost } from '@/models/post.model';
import ApiError from '@/utils/api-error';
import { IReqAuth } from '@/config/interface/shared.interface';
import PostService from '@/services/post.service';
import MediaService from '@/services/media.service';
import User from '@/models/user.model';
import { ApiResPayload } from '@/utils/api';

class PostController {
	async createPost(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const { error } = validateCreatePost(req.body);
			if (error) {
				return next(new ApiError(400, error.details[0].message));
			}

			if (req.body.post_type !== 'share_post') {
				const addMediaIds = req.body.medias.map((item: any) => item.id);
				await MediaService.verifyFiles(addMediaIds, req.user?._id);
			}

			req.body.owner = req.user?._id;

			if (req.body.post_type === 'share_post') {
				const inner_post = await Post.findOne({
					_id: req.body.inner_post,
				});
				if (!inner_post) {
					return next(new ApiError(404, 'Share post not found'));
				}
			}

			const newPost = await PostService.createNewPost(req.body);

			await newPost.populate([
				{
					path: 'owner',
					select: '_id first_name last_name avatar medias',
				},
				{
					path: 'inner_post',
					populate: {
						path: 'owner',
						select: '_id first_name last_name avatar medias',
					},
				},
			]);

			await User.findOneAndUpdate(
				{ _id: req.user?._id },
				{
					$push: {
						posts: {
							post: newPost._id,
							added_at: newPost?.createdAt,
						},
					},
				}
			);

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

			if (req.user?._id !== post.owner?.toString()) {
				return next(
					new ApiError(
						403,
						"You don't have permission to delete this post"
					)
				);
			}

			const mediaIds = post.medias.map((item: any) => item.id);

			const deleted_post = await Post.deleteOne({ _id: req.params.id });

			await MediaService.deleteFiles(mediaIds, req.user?._id);

			await User.findOneAndUpdate(
				{ _id: req.user?._id },
				{
					$pull: {
						posts: {
							post: req.params.id,
						},
					},
				}
			);

			if (post.post_type === 'share_post') {
				await Post.findOneAndUpdate(
					{ _id: post.inner_post },
					{
						$pull: {
							shares: {
								post: post._id,
							},
						},
					}
				);
			}

			return res.status(200).json({
				success: true,
				message: 'Delete post successfully',
				data: { _id: req.params.id },
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async updatePostById(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const post = await Post.findOne({
				_id: req.params.id,
			});
			if (!post) {
				return res.status(404).json({
					success: false,
					message: 'Post not found',
					data: null,
				});
			}
			if (post.owner?.toString() !== req.user?._id) {
				return res.status(404).json({
					success: false,
					message: "You don't have permission to update this post",
					data: null,
				});
			}

			const currentMedias = post.medias;
			const newMedias = req.body.medias;

			const updatedMedias = await MediaService.updateMedias(
				'post',
				req.user?._id,
				currentMedias,
				newMedias
			);

			const updatedPost = await PostService.updatePostById(post._id, {
				...req.body,
				medias: updatedMedias,
			});

			return res.status(200).json({
				success: true,
				message: 'Update post successfully',
				data: updatedPost,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getPostsByUserId(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const user = await User.findOne({ _id: req.params?.id });
			if (!user) {
				return res
					.status(404)
					.json(ApiResPayload(null, false, 'User not found'));
			}

			const visibilityOptions = ['public'];

			let isFriend = user.friends?.some(
				(item) => item.user.toString() === req.user?._id
			);

			if (isFriend) {
				visibilityOptions.push('friend_only');
			}
			if (user._id === req.user?._id) {
				visibilityOptions.push('private');
			}

			const posts = await PostService.getPostsByUserId(
				req.params?.id,
				visibilityOptions
			);

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

	async getFeedPosts(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			let page = Number(req.query?.page) || 0;
			let pageSize = Number(req.query?.pageSize) || 10;

			const posts = await PostService.getFeedPosts(
				req.user?._id,
				req.user?.friends?.map((item) => item.user.toString()) || [],
				page,
				pageSize
			);

			return res.status(200).json({
				success: true,
				message: 'Get feed posts successfully',
				data: {
					page,
					pageSize,
					data: posts,
				},
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getSavedPosts(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			let page = Number(req.query?.page) || 0;
			let pageSize = Number(req.query?.pageSize) || 10;

			const posts = await PostService.getSavedPosts(
				req.user?._id,
				req.user?.posts
					?.map((item) => item.post.toString())
					.reverse() || [],
				page,
				pageSize
			);

			return res.status(200).json({
				success: true,
				message: 'Get saved posts successfully',
				data: {
					page,
					pageSize,
					data: posts,
				},
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async savePost(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const user = await User.findOne({ _id: req.user?._id });
			if (!user) {
				return next(new ApiError(404, 'User not found'));
			}

			const post = await Post.findOne({ _id: req.body.post });
			if (!post) {
				return next(new ApiError(404, 'Post not found'));
			}

			const index = user.posts
				?.map((item) => item.post.toString())
				.indexOf(req.body.post);
			if (index === -1) {
				user.posts?.push({
					post: req.body.post,
					added_at: new Date(),
				});
			}

			await user.save();

			return res.status(200).json({
				success: true,
				message: 'Save post successfully',
				data: null,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async unsavePost(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const user = await User.findOne({ _id: req.user?._id });
			if (!user) {
				return next(new ApiError(404, 'User not found'));
			}

			const post = await Post.findOne({ _id: req.body.post });
			if (!post) {
				return next(new ApiError(404, 'Post not found'));
			}

			const index =
				user.posts
					?.map((item) => item.post.toString())
					.indexOf(req.body.post) || -1;
			if (index !== -1) {
				user.posts?.splice(index, 1);
			}

			await user.save();

			return res.status(200).json({
				success: true,
				message: 'Unsave post successfully',
				data: null,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new PostController();
