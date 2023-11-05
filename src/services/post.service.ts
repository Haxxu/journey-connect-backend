import Post from '@/models/post.model';
import User from '@/models/user.model';

class PostService {
	id?: string;

	constructor(id: string) {
		this.id = id;
	}

	static async createNewPost(payload: object) {
		const newPost = await new Post(payload).save();
		newPost.__v = undefined;

		if (newPost.post_type === 'share_post') {
			await Post.findOneAndUpdate(
				{ _id: newPost.inner_post?.toString() },
				{
					$push: {
						shares: {
							user: newPost.owner?.toString(),
							post: newPost._id,
							added_at: new Date(),
						},
					},
				}
			);
		}

		return newPost;
	}

	static async updatePostById(postId: string, payload: any) {
		const allowedFields = [
			'title',
			'medias',
			'visibility',
			'places',
			'friend_tags',
		];
		const updateData: { [key: string]: any } = {};
		for (const field of allowedFields) {
			if (payload[field] !== undefined) {
				updateData[field] = payload[field];
			}
		}

		const updatedPost = await Post.findByIdAndUpdate(postId, updateData, {
			new: true,
		}).populate([
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
		return updatedPost;
	}

	static async getPostsByUserId(
		userId: string,
		visibilityOptions: string[] = ['public']
	) {
		try {
			const posts = await Post.find({
				owner: userId,
				visibility: { $in: visibilityOptions },
			})
				.populate([
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
				])
				.sort({ createdAt: -1 })
				.exec();

			return posts;
		} catch (error: any) {
			throw new Error(
				'Error fetching posts by user ID: ' + error.message
			);
		}
	}

	static async getFeedPosts(
		userId: string,
		userFriendIds: string[] = [],
		page: number = 0,
		pageSize: number = 10
	) {
		try {
			const posts = await Post.find({
				$or: [
					{ owner: userId },
					{ visibility: 'public' },
					{
						$and: [
							{ visibility: 'friend_only' },
							{ owner: { $in: userFriendIds } },
						],
					},
				],
			})
				.skip(pageSize * page)
				.limit(pageSize)
				.sort({ createdAt: -1 })
				.populate([
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
				])
				.exec();

			return posts;
		} catch (error: any) {
			throw new Error(
				'Error fetching feed posts by user ID: ' + error.message
			);
		}
	}

	static async getSavedPosts(
		userId: string,
		postIds: string[] = [],
		page: number = 0,
		pageSize: number = 10
	) {
		try {
			const postIdIndexMap = new Map();
			postIds.forEach((postId, index) => {
				postIdIndexMap.set(postId, index);
			});

			const posts = await Post.find({
				_id: { $in: postIds },
			})
				.populate([
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
				])
				.exec();

			// Sort the posts based on their positions in the postIds array
			posts.sort((postA, postB) => {
				const indexA = postIdIndexMap.get(postA._id.toString());
				const indexB = postIdIndexMap.get(postB._id.toString());
				return indexA - indexB;
			});

			// Perform pagination and return the sorted posts
			const startIndex = pageSize * page;
			const endIndex = startIndex + pageSize;
			const paginatedPosts = posts.slice(startIndex, endIndex);

			return paginatedPosts;
		} catch (error: any) {
			throw new Error(
				'Error fetching saved posts by user ID: ' + error.message
			);
		}
	}

	static async getPosts(condition: any) {
		try {
			let search = condition.search as string;
			let page = condition.page as string;
			let pageSize = condition.pageSize as string;
			let createdStartDate = condition.createdStartDate as string;
			let createdEndDate = condition.createdEndDate as string;

			const query: any = {};

			if (search) {
				query.$or = [
					{ title: { $regex: new RegExp(search, 'i') } },
					{
						owner: {
							$in: await User.find({
								$or: [
									{
										first_name: {
											$regex: new RegExp(search, 'i'),
										},
									},
									{
										last_name: {
											$regex: new RegExp(search, 'i'),
										},
									},
									{
										email: {
											$regex: new RegExp(search, 'i'),
										},
									},
								],
							}).distinct('_id'),
						},
					},
				];
			}

			if (createdStartDate && createdEndDate) {
				query.createdAt = {
					$gte: new Date(createdStartDate),
					$lte: new Date(createdEndDate),
				};
			} else if (createdStartDate) {
				query.createdAt = { $gte: new Date(createdStartDate) };
			} else if (createdEndDate) {
				query.createdAt = { $lte: new Date(createdEndDate) };
			}

			const options = {
				page: parseInt(page, 10) || 1,
				limit: parseInt(pageSize, 10) || 10,
				sort: { createdAt: -1 },
				populate: [
					{
						path: 'owner',
						select: '_id first_name avatar last_name medias',
					},
					{
						path: 'inner_post',
						populate: {
							path: 'owner',
							select: '_id first_name last_name avatar medias',
						},
					},
				],
			};

			const posts = await Post.paginate(query, options);

			return posts;
		} catch (error) {
			console.error('Error getting post documents:', error);
		}
	}
}

export default PostService;
