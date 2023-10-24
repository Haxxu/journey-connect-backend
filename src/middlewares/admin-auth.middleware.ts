import { env } from '@/config/environment';
import { IReqAuth } from '@/config/interface/shared.interface';
import { IDecodedAuthToken, IUser } from '@/config/interface/user.interface';
import User from '@/models/user.model';
import ApiError from '@/utils/api-error';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

const adminAuth = async (req: IReqAuth, res: Response, next: NextFunction) => {
	try {
		const authHeader = req.header('Authorization');
		if (!authHeader) {
			return res.status(401).json({
				message: 'Access denied, no token provided.',
				success: false,
				data: null,
			});
		}

		const tokenMatch = authHeader.match(/Bearer (.+)/);
		if (!tokenMatch) {
			return res.status(401).json({
				message: 'Access denied, no token provided.',
				success: false,
				data: null,
			});
		}

		const access_token = tokenMatch[1];

		const decoded = <IDecodedAuthToken>(
			jwt.verify(access_token, env.private_access_token_key)
		);
		if (!decoded) {
			{
				return res.status(401).json({
					message: 'Invalid Authentication.',
					success: false,
					data: null,
				});
			}
		}
		const user = await User.findOne({ _id: decoded._id })
			.select('-password')
			.lean();
		if (!user) {
			return res.status(400).json({
				message: 'Failed Authentication. User does not exist.',
				success: false,
				data: null,
			});
		}
		req.user = user;
		req.user._id = user._id.toString();
		if (req.user.role === 'admin') {
			return next();
		}
		return res.status(403).json({
			message: "You don't have permission to perform this action",
			success: false,
			data: null,
		});
	} catch (error) {
		console.log(error);
		return next(new ApiError());
	}
};

export default adminAuth;
