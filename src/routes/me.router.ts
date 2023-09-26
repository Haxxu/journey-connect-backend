import { Router } from 'express';

import meController from '@controllers/me.controller';
import userAuth from '@/middlewares/user-auth.middleware';
import emotionController from '@/controllers/emotion.controller';
import friendController from '@/controllers/friend.controller';

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

// [DELETE] => Unfriend
router.delete('/me/unfriend', [userAuth, friendController.unfriend]);

export default router;
