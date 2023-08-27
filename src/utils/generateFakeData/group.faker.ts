import { faker } from '@faker-js/faker';
import User from '@/models/user.model';
import Group from '@/models/group.model';

export async function generateFakeGroups(count: number): Promise<string[]> {
	const fakeGroups = [];

	const users = await User.find().select('_id');
	const userIds = users.map((user) => user._id.toString());

	for (let i = 0; i < count; i++) {
		let avatar = faker.image.avatar();
		let background = faker.image.urlPicsumPhotos();

		let adminId = faker.helpers.arrayElement(userIds);

		const fakeGroup = {
			_id: faker.database.mongodbObjectId(),
			name: faker.commerce.productName(),
			description: faker.lorem.paragraph(2),
			owner: adminId,
			medias: [
				{
					type: 'avatar',
					url: avatar,
				},
				{
					type: 'background',
					url: background,
				},
				{
					type: 'image',
					url: faker.image.url(),
				},
			],
			avatar: avatar,
			background: background,
			visibility: faker.helpers.arrayElement(['public', 'private']),
			posts: [],
			pinned_posts: [],
			moderation: {
				is_moderate: faker.datatype.boolean(),
				posts: [],
			},
			admins: [{ user: adminId }],
			members: [{ user: adminId, type: 'admin' }],
		};

		fakeGroups.push(fakeGroup);
		const updatedUser = await User.findOneAndUpdate(
			{ _id: adminId },
			{
				$push: {
					joined_groups: {
						group: fakeGroup._id,
						added_at: new Date(),
						type: 'admin',
					},
				},
			},
			{ new: true }
		).exec();
	}

	await Group.insertMany(fakeGroups);
	console.log(`${count} fake groups inserted`);
	return fakeGroups.map((item) => item._id);
}
