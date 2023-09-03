export const ApiResPayload = (
	data: any = null,
	success: boolean = true,
	message: any = ''
) => ({
	data,
	success,
	message,
});
