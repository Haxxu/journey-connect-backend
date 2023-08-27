import { faker } from '@faker-js/faker';
import User from '@model/user.model';
import Group from '@/models/group.model';
import { addUserToGroup, generateFakeUsers } from './user.faker';
import { generateFakeGroups } from './group.faker';
import {
	generateFakeGroupPosts,
	generateFakePosts,
	generateFakeSharePosts,
} from './post.faker';
import Post from '@/models/post.model';
import { generateFakeEmotions } from './emotion.faker';

async function generateFakeData() {
	await User.deleteMany();
	await Group.deleteMany();
	await Post.deleteMany();

	await generateFakeUsers(10);

	await generateFakeGroups(10);

	// Add user to group
	await addUserToGroup();

	// Add individual posts
	await generateFakePosts(30);
	// Add group posts
	await generateFakeGroupPosts(30);
	// Add share posts
	await generateFakeSharePosts(50);

	await generateFakeEmotions(100);

	console.log('Generate fake data successfully');
}

export default generateFakeData;
