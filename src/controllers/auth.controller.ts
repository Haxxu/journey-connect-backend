import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User, { validateCreateUser } from '@/models/user.model';
import ApiError from '@/utils/api-error';
import UserService from '@/services/user.service';
import { env } from '@/config/environment';
import { generateActiveToken } from '@/config/generate-token';
import { validateEmail } from '@/utils/validate';
import { ApiResPayload } from '@/utils/api';
import { IDecodedActiveToken } from '@/config/interface/user.interface';

class AuthController {
	async register(req: Request, res: Response, next: NextFunction) {
		try {
			const { error } = validateCreateUser(req.body);

			if (error) {
				return res.status(400).json({
					success: false,
					message: 'Validation error',
					error: error.details,
					data: null,
				});
			}

			const user = await User.findOne({ email: req.body.email });
			if (user) {
				return res
					.status(400)
					.json(
						ApiResPayload(
							null,
							false,
							'User with given email already registered.'
						)
					);
			}

			const hashedPassword = await bcrypt.hash(
				req.body.password,
				Number(env.hash_salt)
			);

			const newUser = {
				...req.body,
				password: hashedPassword,
			};

			const activeToken = generateActiveToken({ newUser });
			const activeUrl = `${env.client_url}/active?token=${activeToken}`;

			if ((req.body.email as string).endsWith('@journey.com')) {
				const { new_user, access_token } =
					await UserService.createNewUser(newUser);

				return res
					.status(200)
					.json(
						ApiResPayload(
							{ new_user, access_token },
							true,
							'Account created successfully.'
						)
					);
			} else if (validateEmail(req.body.email)) {
				return res
					.status(200)
					.json(ApiResPayload('Success! Please check your email.'));
			} else {
				return res
					.status(400)
					.json(
						ApiResPayload(null, false, 'Register account failed.')
					);
			}
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const user = await User.findOne({ email: req.body.email });
			if (!user) {
				return res
					.status(400)
					.json(
						ApiResPayload(
							null,
							false,
							'Invalid account or password'
						)
					);
			}
			const isValidPassword = await bcrypt.compare(
				req.body.password,
				user.password
			);
			if (!isValidPassword) {
				return res
					.status(400)
					.json(
						ApiResPayload(
							null,
							false,
							'Invalid account or password'
						)
					);
			}
			const access_token = user.generateAccessToken();
			return res
				.status(200)
				.json(ApiResPayload({ access_token }, true, 'Login success.'));
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async active(req: Request, res: Response, next: NextFunction) {
		try {
			const { active_token } = req.body;
			const decoded = <IDecodedActiveToken>(
				jwt.verify(active_token, env.private_active_token_key)
			);

			const { newUser } = decoded;
			if (!newUser) {
				return next(new ApiError(400, 'Invalid authentication.'));
			}

			const user = await User.findOne({ email: newUser.email });
			if (user) {
				return next(
					new ApiError(
						400,
						'User with given email already registered.'
					)
				);
			}

			const { new_user, access_token } = await UserService.createNewUser(
				newUser
			);

			return res
				.status(200)
				.json(
					ApiResPayload(
						{ new_user, access_token },
						true,
						'Login success.'
					)
				);
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new AuthController();
