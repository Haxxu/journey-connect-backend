import Report from '@/models/report.model';

class ReportService {
	id?: string;

	constructor(id: string) {
		this.id = id;
	}

	static async createReport(payload: {
		context_id: string;
		context_type: string;
		content: string;
		reporter: string;
		reported_user: string;
		types: string[];
	}) {
		const newReport = await new Report({
			content: payload.content,
			context_type: payload.context_type,
			[payload.context_type]: payload.context_id,
			reported_user: payload.reported_user,
			reporter: payload.reporter,
			types: payload.types,
		}).save();
		return newReport;
	}
}

export default ReportService;
