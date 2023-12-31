import { IReqAuth } from '@/config/interface/shared.interface';
import Comment from '@/models/comment.model';
import Post from '@/models/post.model';
import Report from '@/models/report.model';
import ReportService from '@/services/report.service';
import ApiError from '@/utils/api-error';
import { NextFunction, Response } from 'express';

class ReportController {
	async report(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const { context_type, context_id, content, types } = req.body;

			let context;
			let reported_user = '';
			if (context_type === 'post') {
				context = await Post.findOne({ _id: context_id });
				reported_user = context?.owner?.toString() || '';
				if (!context) {
					return next(new ApiError(404, 'Report post not found'));
				}
			} else if (context_type === 'comment') {
				context = await Comment.findOne({ _id: context_id }).populate(
					[]
				);
				reported_user = context?.owner?.toString() || '';
				if (!context) {
					return next(new ApiError(404, 'Report post not found'));
				}
			}

			const report = await ReportService.createReport({
				content,
				context_type,
				context_id,
				reporter: req.user?._id,
				reported_user,
				types,
			});

			return res.status(200).json({
				success: true,
				message: `Report ${context_type} successfully`,
				data: report,
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async getReports(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const reports = await ReportService.getReports(req.query);

			return res.status(200).json({
				success: true,
				message: 'Get reports successfully',
				data: reports,
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}

	async deleteReportById(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			await Report.deleteOne({ _id: req.params.id });

			return res.status(200).json({
				success: true,
				message: 'Delete report successfully',
				data: null,
			});
		} catch (error) {
			console.error(error);
			return next(new ApiError());
		}
	}
}

export default new ReportController();
