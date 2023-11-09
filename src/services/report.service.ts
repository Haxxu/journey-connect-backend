import Post from '@/models/post.model';
import Report from '@/models/report.model';
import User from '@/models/user.model';

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

	static async getReports(condition: any) {
		try {
			let search = condition.search as string;
			let page = condition.page as string;
			let pageSize = condition.pageSize as string;

			const query: any = {
				context_type: condition.context_type,
			};

			if (search) {
				let users = await User.find({
					$or: [
						{
							first_name: {
								$regex: new RegExp(search, 'i'),
							},
						},
						{
							last_name: {
								$regex: new RegExp(search, 'i'),
							},
						},
						{
							email: {
								$regex: new RegExp(search, 'i'),
							},
						},
					],
				}).distinct('_id');

				query.$or = [
					{ content: { $regex: new RegExp(search, 'i') } },
					{
						reporter: {
							$in: users,
						},
					},
					{
						reported_user: {
							$in: users,
						},
					},
				];
			}

			const options = {
				page: parseInt(page, 10) || 1,
				limit: parseInt(pageSize, 10) || 10,
				sort: { createdAt: -1 },
				populate: [
					{
						path: 'reporter',
						select: '_id first_name avatar last_name medias',
					},
					{
						path: 'reported_user',
						select: '_id first_name avatar last_name medias',
					},
					{
						path: 'post',
						// populate: {
						// 	path: 'owner',
						// 	select: '_id first_name last_name avatar medias',
						// },
						populate: [
							{
								path: 'owner',
								select: '_id first_name last_name avatar medias',
							},
							{
								path: 'inner_post',
								populate: {
									path: 'owner',
									select: '_id first_name last_name avatar medias',
								},
							},
						],
					},
					{
						path: 'comment',
						populate: {
							path: 'owner',
							select: '_id first_name last_name avatar medias',
						},
					},
				],
			};

			const reports = await Report.paginate(query, options);

			return reports;
		} catch (error) {
			console.error('Error getting reports documents:', error);
		}
	}
}

export default ReportService;
