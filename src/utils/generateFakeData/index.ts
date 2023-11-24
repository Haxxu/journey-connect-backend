import { faker } from '@faker-js/faker';
import User from '@models/user.model';
import Group from '@models/group.model';
import { addUserToGroup, generateFakeUsers } from './user.faker';
import { generateFakeGroups } from './group.faker';
import {
	generateCombinedAndShuffledFakePosts,
	generateFakeGroupPosts,
	generateFakePosts,
	generateFakeSharePosts,
} from './post.faker';
import Post from '@/models/post.model';
import { generateFakeEmotions } from './emotion.faker';
import { generateFakeComments } from './comment.faker';
import Comment from '@/models/comment.model';
import Emotion from '@/models/emotion.model';

async function generateFakeData() {
	try {
		// await generateFakeUsers(100);
		// await generateCombinedAndShuffledFakePosts(50, 50);
		// await generateFakePosts(200);
		// await generateFakeSharePosts(200);
		// await generateFakeEmotions(2000);
		// await generateFakeComments(1000);
	} catch (error) {
		console.log(error);
	}
	return;

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

	// await User.deleteMany();
	// await Group.deleteMany();
	// await Post.deleteMany();

	// await generateFakeGroups(10);

	// Add user to group
	// await addUserToGroup();

	// Add individual posts
	await generateFakePosts(30);
	// Add group posts
	// await generateFakeGroupPosts(30);
	// Add share posts
	await generateFakeSharePosts(50);

	await generateFakeEmotions(100);

	await generateFakeComments(100);

	console.log('Generate fake data successfully');
}

export default generateFakeData;
