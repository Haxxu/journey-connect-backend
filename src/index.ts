import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { env } from '@config/environment';
import database from '@config/database';
import errorHandler from '@middleware/error-handler.middleware';
import generateFakeData from '@util/generateFakeData';

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

// Error handler
app.use(errorHandler);

// Listen
app.listen(env.port, () =>
	console.log(`⚡️[server]: Server is running at port ${env.port}`)
);
