import { env } from '@/config/environment';
import Emotion from '@/models/emotion.model';
import Post from '@/models/post.model';
import User from '@/models/user.model';
import axios from 'axios';

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

	static async getPostsById(
		postId: string,
		visibilityOptions: string[] = ['public']
	) {
		try {
			const posts = await Post.findOne({
				_id: postId,
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
			throw new Error('Error fetching posts by ID: ' + error.message);
		}
	}

	static async getPostsByUserId(
		userId: string,
		visibilityOptions: string[] = ['public']
	) {
		try {
			const posts = await Post.find({
				owner: userId,
				visibility: { $in: visibilityOptions },
				status: 'active',
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
				status: 'active',
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

	static async getRecommendPosts(
		userId: string,
		userFriendIds: string[] = [],
		page: number = 0,
		pageSize: number = 10
	) {
		try {
			// Step 1: Fetch recommended posts using the ML API
			const response = await axios.get(
				`${env.recommendApiUrl}/recommend/${userId}`
			);
			const recommendedPosts = response.data.recommendations;

			// Step 2: Extract post IDs and scores
			const postIds = recommendedPosts.map((post: any) => post.post_id);
			const postScores = recommendedPosts.map((post: any) => post.score);

			// Step 3: Fetch posts from MongoDB based on post IDs with pagination
			const posts = await Post.find({
				_id: { $in: postIds },
				status: 'active',
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
				.skip(page * pageSize)
				.limit(pageSize)
				.exec();

			// Step 4: Order fetched posts based on the order of post IDs from the ML API
			const orderedPosts = postIds.map((postId: any) =>
				posts.find((post) => post._id.equals(postId))
			);

			return posts;
		} catch (error: any) {
			return [];
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

			let length = posts.docs?.length || 0;

			for (let i = 0; i < length; ++i) {
				const emotions = await Emotion.find({
					post: posts.docs[i]._id,
				});

				const emotionInfo = {
					total: emotions.length,
					sad: emotions.filter((emotion) => emotion.type === 'sad')
						.length,
					like: emotions.filter((emotion) => emotion.type === 'like')
						.length,
					heart: emotions.filter(
						(emotion) => emotion.type === 'heart'
					).length,
					wow: emotions.filter((emotion) => emotion.type === 'wow')
						.length,
					haha: emotions.filter((emotion) => emotion.type === 'haha')
						.length,
					angry: emotions.filter(
						(emotion) => emotion.type === 'angry'
					).length,
				};

				posts.docs[i].emotionInfo = emotionInfo;
			}

			const responseData = {
				...posts,
				docs: posts.docs.map((post) => ({
					...post.toObject(),
					emotionInfo: post.emotionInfo,
				})),
			};

			return responseData;
		} catch (error) {
			console.error('Error getting post documents:', error);
		}
	}

	static async getPostByEmotion(limit: number = 10) {
		try {
			const emotionCounts = await Emotion.aggregate([
				{
					$match: {
						context_type: 'post',
					},
				},
				{
					$group: {
						_id: '$post',
						totalEmotions: { $sum: 1 },
						sad: {
							$sum: { $cond: [{ $eq: ['$type', 'sad'] }, 1, 0] },
						},
						like: {
							$sum: { $cond: [{ $eq: ['$type', 'like'] }, 1, 0] },
						},
						heart: {
							$sum: {
								$cond: [{ $eq: ['$type', 'heart'] }, 1, 0],
							},
						},
						haha: {
							$sum: { $cond: [{ $eq: ['$type', 'haha'] }, 1, 0] },
						},
						wow: {
							$sum: { $cond: [{ $eq: ['$type', 'wow'] }, 1, 0] },
						},
						angry: {
							$sum: {
								$cond: [{ $eq: ['$type', 'angry'] }, 1, 0],
							},
						},
					},
				},
			]);

			// Sort the post IDs based on total emotions (descending order)
			emotionCounts.sort((a, b) => b.totalEmotions - a.totalEmotions);

			const sortedPostIds = emotionCounts.map((item) => item._id);

			// Retrieve the corresponding posts
			const posts = await Post.find({ _id: { $in: sortedPostIds } })
				.populate('owner', '_id first_name avatar last_name medias')
				.populate({
					path: 'inner_post',
					populate: {
						path: 'owner',
						select: '_id first_name last_name avatar medias',
					},
				})
				.limit(limit)
				.exec();

			// Calculate emotionInfo for each post
			let length = posts.length;
			for (let i = 0; i < length; ++i) {
				const emotions = emotionCounts.find(
					(item) => item._id && item._id.equals(posts[i]._id)
				);
				const emotionInfo = {
					total: emotions ? emotions.totalEmotions : 0,
					sad: emotions ? emotions.sad : 0,
					like: emotions ? emotions.like : 0,
					heart: emotions ? emotions.heart : 0,
					wow: emotions ? emotions.wow : 0,
					haha: emotions ? emotions.haha : 0,
					angry: emotions ? emotions.angry : 0,
				};
				posts[i].emotionInfo = emotionInfo;
			}

			posts.sort(
				(a, b) =>
					(b?.emotionInfo?.total || 0) - (a?.emotionInfo?.total || 0)
			);

			const responseData = posts.map((post) => ({
				...post.toObject(),
				emotionInfo: post.emotionInfo,
			}));
			return responseData;
		} catch (error) {
			console.error('Error getting post documents:', error);
		}
	}
}

export default PostService;
