import { faker } from '@faker-js/faker';
import User from '@models/user.model';
import Post from '@models/post.model';
import Comment from '@/models/comment.model';

export async function generateFakeComments(count: number): Promise<string[]> {
	const fakeComments = [];

	const posts = await Post.find({
		post_type: { $in: ['share_post', 'individual_post'] },
		visibility: { $in: ['public'] },
	}).select('_id');

	const postIds = posts.map((post) => post._id.toString());
	const users = await User.find().select('_id');
	const userIds = users.map((user) => user._id.toString());
	if (postIds.length === 0 || userIds.length === 0) {
		return [];
	}

	for (let i = 0; i < count; i++) {
		let ownerId = faker.helpers.arrayElement(userIds);
		let postId = faker.helpers.arrayElement(postIds);

		const post = await Post.findOne({ _id: postId });

		const fakeComment = {
			_id: faker.database.mongodbObjectId(),
			content: faker.lorem.paragraphs(),
			context_type: 'post',
			context_owner: post?.owner?.toString(),
			owner: ownerId,
			post: postId,
		};

		fakeComments.push(fakeComment);
	}

	await Comment.insertMany(fakeComments);
	console.log(`${count} fake comments inserted`);
	return fakeComments.map((item) => item._id);
}
