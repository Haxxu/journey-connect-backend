import ApiError from '@/utils/api-error';
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (
	err: ApiError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const errorStatusCode = err.statusCode || 500;
	const errorMessage = err.message || 'Something went wrong';

	return res
		.status(errorStatusCode)
		.json({ code: errorStatusCode, success: false, message: errorMessage });
};

export default errorHandler;
