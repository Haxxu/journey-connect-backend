import { faker } from '@faker-js/faker';
import User from '@models/user.model';
import Group from '@models/group.model';
import { addUserToGroup, generateFakeUsers } from './user.faker';
import { generateFakeGroups } from './group.faker';
import {
	generateFakeGroupPosts,
	generateFakePosts,
	generateFakeSharePosts,
} from './post.faker';
import Post from '@/models/post.model';
import { generateFakeEmotions } from './emotion.faker';
import Comment from '@/models/comment.model';
import Emotion from '@/models/emotion.model';

async function generateFakeData() {
	// try {
	// const result = await Comment.updateMany(
	// 	{ status: { $exists: false } }, // Only update documents that don't have the role field
	// 	{ $set: { status: 'active' } }
	// );

	// const result = await Emotion.updateMany(
	// 	{ type: 'smile' }, // Only update documents that don't have the role field
	// 	{ $set: { type: 'haha' } }
	// );
	// 	console.log('Updated', 'documents to set role to "user".');
	// } catch (err) {
	// 	console.error('Error updating documents:', err);
	// } finally {
	// 	// Close the database connection if needed
	// }
	return;
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
