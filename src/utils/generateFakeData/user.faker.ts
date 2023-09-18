import { faker } from '@faker-js/faker';
import User from '@models/user.model';
import Group from '@models/group.model';

export async function generateFakeUsers(count: number): Promise<string[]> {
	const fakeUsers = [];

	for (let i = 0; i < count; i++) {
		let avatar = faker.image.avatar();
		let background = faker.image.urlPicsumPhotos();

		const fakeUser = {
			_id: faker.database.mongodbObjectId(),
			username: faker.internet.userName(),
			email: faker.internet.email(),
			password:
				'$2b$10$NB9Nqpi./k.pgKESfYszXOTwMsHZZKZ6z5VuqBjvadpQJ/RyDaPFu',
			first_name: faker.person.firstName(),
			last_name: faker.person.lastName(),
			birth_date: faker.date.birthdate(),
			gender: faker.helpers.arrayElement(['male', 'female', 'other']),
			work_places: [
				{
					name: faker.company.name(),
					start_year: faker.helpers.arrayElement([
						2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
						2009,
					]),
				},
			],
			schools: [
				{
					name: faker.location.city(),
					start_year: faker.helpers.arrayElement([
						2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
						2009,
					]),
				},
			],
			living_places: [
				{
					name: faker.location.city(),
					start_year: faker.helpers.arrayElement([
						2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
						2009,
					]),
					city: faker.location.city(),
				},
			],
			phone: faker.phone.number('+81 ### ### ###'),
			country: faker.location.country(),
			avatar: avatar,
			background: background,
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
			friends: [] as { user?: string; added_at?: Date }[],
		};

		fakeUsers.push(fakeUser);
	}

	// Add friend
	for (let i = 0; i < count; ++i) {
		let num = faker.number.int({ min: 1, max: count - 1 });

		const pushedIds = [fakeUsers[0]._id];

		for (let j = 0; j < num; ++j) {
			let randomIndex = faker.number.int({ min: 0, max: count - 1 });
			if (!pushedIds.includes(fakeUsers[randomIndex]._id)) {
				fakeUsers[i].friends.push({
					user: fakeUsers[randomIndex]._id,
					added_at: new Date(Date.now()),
				});
				pushedIds.push(fakeUsers[j]._id);
			} else {
				j--;
			}
		}
	}

	// Remove all existing users before inserting new fake users

	await User.insertMany(fakeUsers);
	console.log(`${count} fake users inserted`);
	return fakeUsers.map((item) => item._id);
}

export async function addUserToGroup() {
	const groups = await Group.find();
	const users = await User.find();

	for (const group of groups) {
		// Exclude the admin/owner from the users list
		const usersToBeAdded = users.filter(
			(user) => user._id.toString() !== group.owner.toString()
		);

		// Generate a random number of users to add to the group
		const numberOfUsersToAdd = faker.number.int({
			min: 0,
			max: usersToBeAdded.length,
		});

		// Shuffle the users array to randomly select users
		faker.helpers.shuffle(usersToBeAdded);

		// Select the first numberOfUsersToAdd users
		const usersToAdd = usersToBeAdded.slice(0, numberOfUsersToAdd);

		for (const user of usersToAdd) {
			group.members?.push({
				user: user._id,
				added_at: new Date(),
				type: 'member',
			});

			user.joined_groups?.push({
				group: group._id,
				added_at: new Date(),
			});

			await user.save();
		}

		await group.save();
	}

	console.log('Add user to group generated successfully');
}
