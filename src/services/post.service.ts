import Post from '@/models/post.model';

class PostService {
	id?: string;

	constructor(id: string) {
		this.id = id;
	}

	static async createNewPost(payload: object) {}
}

export default PostService;
