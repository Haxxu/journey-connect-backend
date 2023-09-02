class ApiError extends Error {
	statusCode: number;
	message: string;

	constructor(statusCode?: number, message?: string) {
		super();
		this.statusCode = statusCode || 500;
		this.message = message || 'Something went wrong';
	}
}

export default ApiError;