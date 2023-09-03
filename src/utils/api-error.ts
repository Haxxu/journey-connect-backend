class ApiError extends Error {
	statusCode: number;
	message: string;
	success: boolean = false;

	constructor(statusCode?: number, message?: string) {
		super();
		this.statusCode = statusCode || 500;
		this.message = message || 'Something went wrong';
		this.success = false;
	}
}

export default ApiError;
