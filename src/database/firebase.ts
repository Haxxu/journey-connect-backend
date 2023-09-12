import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

import config from '@/config/firebase.config';
import { env } from '@/config/environment';

export const app = initializeApp(config.firebaseConfig);

export const storage = getStorage(app, env.firebaseDBUrl);
