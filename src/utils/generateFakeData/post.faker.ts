import { faker } from '@faker-js/faker';
import User from '@models/user.model';
import Group from '@models/group.model';
import Post from '@models/post.model';

export async function generateFakePosts(count: number): Promise<string[]> {
	const fakePosts = [];

	const users = await User.find().select('_id');
	const userIds = users.map((user) => user._id.toString());
	const numbers = [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	for (let i = 0; i < count; i++) {
		let ownerId = faker.helpers.arrayElement(userIds);

		let numOfImages = faker.helpers.arrayElement(numbers);
		let medias = [];

		for (let i = 0; i < numOfImages; ++i) {
			medias.push({
				type: 'image',
				url: faker.image.url(),
			});
		}

		const fakePost = {
			_id: faker.database.mongodbObjectId(),
			title: faker.lorem.paragraphs(),
			owner: ownerId,
			medias: medias,
			post_type: 'individual_post',
			visibility: faker.helpers.arrayElement([
				'friend_only',
				'public',
				'private',
			]),
		};

		fakePosts.push(fakePost);
		await User.findOneAndUpdate(
			{ _id: ownerId },
			{
				$push: {
					posts: {
						post: fakePost._id,
						added_at: new Date(),
					},
				},
			},
			{ new: true }
		).exec();
	}

	await Post.insertMany(fakePosts);
	console.log(`${count} fake posts inserted`);
	return fakePosts.map((item) => item._id);
}

export async function generateFakeGroupPosts(count: number): Promise<string[]> {
	const fakePosts = [];
	const numbers = [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	const groups = await Group.find().select('_id');
	const groupIds = groups.map((group) => group._id.toString());

	for (let i = 0; i < count; i++) {
		let groupId = faker.helpers.arrayElement(groupIds);
		const group = await Group.findOne({ _id: groupId });
		const userIds =
			group?.members.map((item) => item.user.toString()) || [];

		let numOfImages = faker.helpers.arrayElement(numbers);
		let medias = [];

		for (let i = 0; i < numOfImages; ++i) {
			medias.push({
				type: 'image',
				url: faker.image.url(),
			});
		}

		const fakePost = {
			_id: faker.database.mongodbObjectId(),
			title: faker.lorem.paragraphs(),
			owner: faker.helpers.arrayElement(userIds),
			medias: medias,
			post_type: 'group_post',
			visibility: `${group?.visibility}_group`,
			group: groupId,
		};

		fakePosts.push(fakePost);

		await User.findOneAndUpdate(
			{ _id: fakePost.owner },
			{
				$push: {
					posts: {
						post: fakePost._id,
						added_at: new Date(),
					},
				},
			},
			{ new: true }
		).exec();
		await group
			?.updateOne({
				$push: {
					posts: {
						post: fakePost._id,
						added_at: new Date(),
					},
				},
			})
			.exec();
	}

	await Post.insertMany(fakePosts);
	console.log(`${count} fake group posts inserted`);
	return fakePosts.map((item) => item._id);
}

export async function generateFakeSharePosts(count: number): Promise<string[]> {
	const fakePosts = [];

	const users = await User.find().select('_id');
	const userIds = users.map((user) => user._id.toString());
	const posts = await Post.find({ visibility: 'public' }).select('_id');
	const postIds = posts.map((post) => post._id.toString());

	for (let i = 0; i < count; i++) {
		let ownerId = faker.helpers.arrayElement(userIds);

		const fakePost = {
			_id: faker.database.mongodbObjectId(),
			title: faker.lorem.paragraph(),
			owner: ownerId,
			post_type: 'share_post',
			visibility: faker.helpers.arrayElement([
				'friend_only',
				'public',
				'private',
			]),
			inner_post: faker.helpers.arrayElement(postIds),
		};

		fakePosts.push(fakePost);
		await User.findOneAndUpdate(
			{ _id: ownerId },
			{
				$push: {
					posts: {
						post: fakePost._id,
						added_at: new Date(),
					},
				},
			},
			{ new: true }
		).exec();
		await Post.findOneAndUpdate(
			{ _id: fakePost.inner_post },
			{
				$push: {
					shares: {
						post: fakePost._id,
						added_at: new Date(),
					},
				},
			}
		);
	}

	await Post.insertMany(fakePosts);
	console.log(`${count} fake posts inserted`);
	return fakePosts.map((item) => item._id);
}
