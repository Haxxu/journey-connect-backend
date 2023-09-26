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

export default router;
