import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { env } from './config/environment';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Listen
app.listen(env.port, () =>
	console.log(`⚡️[server]: Server is running at port ${env.port}`)
);
