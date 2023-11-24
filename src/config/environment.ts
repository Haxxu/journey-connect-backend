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

	// Firebase
	apiKey: process.env.API_KEY || '',
	authDomain: process.env.AUTH_DOMAIN || '',
	projectId: process.env.PROJECT_ID || '',
	storageBucket: process.env.STORAGE_BUCKET || '',
	messagingSenderId: process.env.MESSAGING_SENDER_ID || '',
	appId: process.env.APP_ID || '',
	measurementId: process.env.MEASUREMENT_ID,
	firebaseDBUrl: process.env.FIREBASE_DB_URL,

	recommendApiUrl: process.env.RECOMMEND_API_URL,

	mailClientId: process.env.MAIL_CLIENT_ID || '',
	mailClientSecret: process.env.MAIL_CLIENT_SECRET || '',
	mailRefreshToken: process.env.MAIL_REFRESH_TOKEN || '',
	senderMailAddress: process.env.SENDER_MAIL_ADDRESS || '',
};
