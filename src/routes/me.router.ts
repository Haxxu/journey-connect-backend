import { Router } from 'express';

import meController from '@controllers/me.controller';
import userAuth from '@/middlewares/user-auth.middleware';
import emotionController from '@/controllers/emotion.controller';
import friendController from '@/controllers/friend.controller';
import adminAuth from '@/middlewares/admin-auth.middleware';
import postController from '@/controllers/post.controller';

const router = Router();

// [GET] => get me info
router.get('/me/info', [userAuth, meController.getInfo]);

// [GET] => get posts
router.get('/me/posts', [userAuth, meController.getPosts]);

// [PUT] => update me avatar, background
router.put('/me/update-image', [userAuth, meController.updateImage]);

// [GET] => get me emotion
router.get('/me/emotions', [userAuth, emotionController.getMyEmotion]);

// FRIEND
// [GET] => check is friend
router.get('/me/is-friend', [userAuth, friendController.checkIsFriend]);

// [GET] => get my friends
router.get('/me/friends', [userAuth, friendController.getMyFriends]);

// [POST] => add friend
router.post('/me/add-friend', [userAuth, friendController.addFriend]);

// [GET] => get sent friend requests
router.get('/me/sent-friend-requests', [
	userAuth,
	friendController.getSentFriendRequests,
]);

// [GET] => get received friend requests
router.get('/me/received-friend-requests', [
	userAuth,
	friendController.getReceivedFriendRequests,
]);

// [PUT] => get received friend requests
router.put('/me/friend-request', [
	userAuth,
	friendController.validateFriendRequest,
]);

// [PUT] => get received friend requests
router.put('/me/friend-request', [
	userAuth,
	friendController.validateFriendRequest,
]);

// [GET] => get friend status
router.get('/me/friend-status', [userAuth, friendController.checkFriendStatus]);

// [DELETE] => Unfriend
router.delete('/me/unfriend', [userAuth, friendController.unfriend]);

// [DELETE] => Cancel sent friend request
router.delete('/me/cancel-friend-request', [
	userAuth,
	friendController.cancelFriendRequest,
]);

// [GET] => Get mutal friends
router.get('/me/mutual-friends', [userAuth, friendController.getMutualFriends]);

// [GET] => Check is admin
router.get('/me/is-admin', [adminAuth, meController.isAdmin]);

// [GET] => Get saved posts
router.get('/me/saved-posts', [adminAuth, postController.getSavedPosts]);

// [POST] => save post
router.post('/me/posts', [userAuth, postController.savePost]);

// [POST] => unsave post
router.delete('/me/posts', [userAuth, postController.unsavePost]);

export default router;
