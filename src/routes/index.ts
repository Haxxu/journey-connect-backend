import authRouter from './auth.router';
import fileRouter from './file.router';
import postRouter from './post.router';
import meRouter from './me.router';
import userRouter from './user.router';
import emotionRouter from './emotion.router';
import commentRouter from './comment.router';
import reportRouter from './report.router';
import recommendRouter from './recommend.router';
import chatRouter from './chat.router';
import messageRouter from './message.router';

const routes: any = [
	authRouter,
	fileRouter,
	postRouter,
	meRouter,
	userRouter,
	emotionRouter,
	commentRouter,
	reportRouter,
	recommendRouter,
	chatRouter,
	messageRouter,
];

export default routes;
