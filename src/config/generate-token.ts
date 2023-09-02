import jwt from 'jsonwebtoken';
import { env } from './environment';

export const generateAccessToken = function (payload: object): string {
	const token = jwt.sign(payload, env.private_access_token_key as string, {
		expiresIn: '15m',
	});

	return token;
};

export const generateRefreshToken = function (payload: object): string {
	const token = jwt.sign(payload, env.private_refresh_token_key as string, {
		expiresIn: '14d',
	});

	return token;
};
export const generateActiveToken = function (payload: object): string {
	const token = jwt.sign(payload, env.private_active_token_key as string, {
		expiresIn: '10m',
	});

	return token;
};
