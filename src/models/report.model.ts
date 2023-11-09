import mongoose, { PaginateModel } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

import { IReport } from '@/config/interface/report.interface';

type ReportModel = mongoose.Model<IReport, {}, {}>;

const reportSchema = new mongoose.Schema<IReport, ReportModel, {}>(
	{
		content: {
			type: String,
			required: true,
		},
		context_type: {
			type: String,
			default: 'post', // comment
		},
		post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
		comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
		reporter: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		reported_user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		types: [
			{
				type: String,
			},
		],
		status: {
			type: String,
			default: 'pending', // accept, decline
		},
	},
	{ timestamps: true }
);

reportSchema.plugin(mongoosePaginate);

const Report = mongoose.model<IReport, PaginateModel<IReport>>(
	'Report',
	reportSchema
);

export default Report;
