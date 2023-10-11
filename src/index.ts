import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http';

import { env } from '@configs/environment';
import database from '@configs/database';
import errorHandler from '@middlewares/error-handler.middleware';
import generateFakeData from '@utils/generateFakeData';
import routes from '@/routes';
import { SocketServer } from '@/config/socket';
import { Server } from 'socket.io';

dotenv.config();

const app = express();

console.log('\n\n--------------------------------------');

// Database
database.connect(env.mongodb_url);

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Reset database and generate new data
// generateFakeData();

// Socket.io
const server = http.createServer(app);
export const io = new Server(server, {
	cors: {
		origin: env.client_url,
	},
});
io.on('connection', (socket) => {
	SocketServer(socket);
});

// Routes
app.use('/api', routes);

// Error handler
app.use(errorHandler);

// Listen
// app.listen(env.port, () =>
// 	console.log(`⚡️[server]: Server is running at port ${env.port}`)
// );
server.listen(env.port, () =>
	console.log(`⚡️[server]: Server is running at port ${env.port}`)
);
