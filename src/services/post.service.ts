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
}

export default PostService;
