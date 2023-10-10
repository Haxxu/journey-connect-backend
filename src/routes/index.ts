import authRouter from './auth.router';
import fileRouter from './file.router';
import postRouter from './post.router';
import meRouter from './me.router';
import userRouter from './user.router';
import emotionRouter from './emotion.router';
import commentRouter from './comment.router';

const routes: any = [
	authRouter,
	fileRouter,
	postRouter,
	meRouter,
	userRouter,
	emotionRouter,
	commentRouter,
];

export default routes;
