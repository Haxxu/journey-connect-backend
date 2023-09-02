import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';

import User, { validateCreateUser } from '@/models/user.model';
import ApiError from '@/utils/api-error';
import UserService from '@/services/user.service';
import { env } from '@/config/environment';
import { generateActiveToken } from '@/config/generate-token';
import { validateEmail } from '@/utils/validate';

class AuthController {
	async register(req: Request, res: Response, next: NextFunction) {
		try {
			const { error } = validateCreateUser(req.body);
			if (error) {
				return next(new ApiError(400, error.details[0].message));
			}

			const user = await User.findOne({ email: req.body.email });
			console.log(user);
			if (user) {
				return next(
					new ApiError(
						400,
						'User with given email already registered.'
					)
				);
			}

			// const hashedPassword = await bcrypt.hash(
			// 	req.body.password,
			// 	Number(env.hash_salt)
			// );
			const newUser = {
				...req.body,
				password: req.body.password,
			};
			console.log(newUser);

			const activeToken = generateActiveToken({ newUser });
			const activeUrl = `${env.client_url}/active?token=${activeToken}`;

			if ((req.body.email as string).endsWith('@journey.com')) {
				const { new_user, access_token } =
					await UserService.createNewUser(newUser);

				return res.status(200).json({
					data: {
						newUser: new_user,
						access_token,
					},
					success: true,
					message: 'Account created successfully!',
				});
			} else if (validateEmail(req.body.email)) {
				return res.status(200).json({
					data: null,
					success: true,
					message: 'Success! Please check your email.',
				});
			} else {
				return res.status(400).json({
					data: null,
					success: false,
					message: 'Register account failed.',
				});
			}
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new AuthController();
