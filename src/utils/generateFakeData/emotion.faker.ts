import { faker } from '@faker-js/faker';
import Group from '@models/group.model';
import User from '@models/user.model';
import Post from '@models/post.model';
import Emotion from '@models/emotion.model';

export async function generateFakeEmotions(count: number): Promise<string[]> {
	const fakeEmotions = [];

	const posts = await Post.find({
		post_type: { $in: ['group_post', 'individual_post'] },
		visibility: { $in: ['public', 'public_group'] },
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
		const emotion = await Emotion.findOne({ owner: ownerId, post: postId });
		if (emotion) {
			continue;
		}

		const fakeEmotion = {
			_id: faker.database.mongodbObjectId(),
			owner: ownerId,
			context_type: 'post',
			post: postId,
			emotion_date: new Date(),
			type: faker.helpers.arrayElement([
				'like',
				'love',
				'heart',
				'smile',
				'sad',
				'angry',
			]),
		};

		fakeEmotions.push(fakeEmotion);

		await post
			?.updateOne({
				$push: {
					emotions: {
						emotion: fakeEmotion._id,
						added_at: new Date(),
					},
				},
			})
			.exec();
	}

	await Emotion.insertMany(fakeEmotions);
	console.log(`${count} fake emotions inserted`);
	return fakeEmotions.map((item) => item._id);
}
