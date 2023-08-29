import { NextFunction, Request, Response } from 'express';

class AuthController {
	async register(req: Request, res: Response, next: NextFunction) {}
}

export default new AuthController();
