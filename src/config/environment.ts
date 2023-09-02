import dotenv from 'dotenv';

dotenv.config();

export const env = {
	port: process.env.PORT || 8081,
	mongodb_url: process.env.MONGODB_URL || '',
	jwt_private_key: process.env.JWT_PRIVATE_KEY || '',
	private_access_token_key: process.env.PRIVATE_ACCESS_TOKEN_KEY || '',
	private_refresh_token_key: process.env.PRIVATE_REFRESH_TOKEN_KEY || '',
	private_active_token_key: process.env.PRIVATE_ACTIVE_TOKEN_KEY || '',
	hash_salt: process.env.HASH_SALT || '',
	client_url: process.env.CLIENT_URL || '',
};
