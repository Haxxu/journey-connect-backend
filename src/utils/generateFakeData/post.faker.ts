import { faker } from '@faker-js/faker';
import User from '@models/user.model';
import Group from '@models/group.model';
import Post from '@models/post.model';
import { MEDIAS } from '../mock/medias';

function getRandomNumbers(n: number, m: number) {
	if (n > m) {
		throw new Error('n must be less than or equal to m');
	}

	// Create an array of numbers from 0 to m-1
	const numbersArray = Array.from({ length: m }, (_, index) => index);

	// Shuffle the array
	for (let i = numbersArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[numbersArray[i], numbersArray[j]] = [numbersArray[j], numbersArray[i]];
	}

	// Return the first n elements
	return numbersArray.slice(0, n);
}

export async function generateFakePosts(count: number): Promise<any[]> {
	const fakePosts = [];

	const users = await User.find().select('_id');
	const userIds = users.map((user) => user._id.toString());
	const numbers = [0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	const mediasLength = MEDIAS.length;

	for (let i = 0; i < count; i++) {
		let ownerId = faker.helpers.arrayElement(userIds);

		let numOfImages = faker.helpers.arrayElement(numbers);
		let medias = [];
		const mediaIndexArr = getRandomNumbers(numOfImages, mediasLength - 1);
		let mediaIndexArrLeng = mediaIndexArr.length;

		for (let i = 0; i < mediaIndexArrLeng; ++i) {
			medias.push({
				type: 'image',
				url: MEDIAS[mediaIndexArr[i]].url,
				id: MEDIAS[mediaIndexArr[i]].id,
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

	return fakePosts;
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

export async function generateFakeSharePosts(count: number): Promise<any[]> {
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
						user: ownerId,
						post: fakePost._id,
						added_at: new Date(),
					},
				},
			}
		);
	}

	return fakePosts;
	await Post.insertMany(fakePosts);
	console.log(`${count} fake posts inserted`);
	return fakePosts.map((item) => item._id);
}

export async function generateCombinedAndShuffledFakePosts(
	countShare: number,
	countIndividual: number
): Promise<any[]> {
	const sharePosts = await generateFakeSharePosts(countShare);
	const individualPosts = await generateFakePosts(countIndividual);

	// Combine the two arrays
	const combinedPosts = [...sharePosts, ...individualPosts];

	// Shuffle the combined array
	const shuffledPosts = shuffleArray(combinedPosts);
	await Post.insertMany(shuffledPosts);
	console.log(`${shuffledPosts.length} fake posts inserted`);
	return shuffledPosts;
}

function shuffleArray<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
