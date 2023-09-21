import Post from '@/models/post.model';

class PostService {
	id?: string;

	constructor(id: string) {
		this.id = id;
	}

	static async createNewPost(payload: object) {
		const newPost = await new Post(payload).save();
		newPost.__v = undefined;
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
		});
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
				.populate('owner', '_id first_name last_name avatar medias')
				.sort({ createdAt: -1 })
				.exec();

			return posts;
		} catch (error: any) {
			throw new Error(
				'Error fetching posts by user ID: ' + error.message
			);
		}
	}
}

export default PostService;
