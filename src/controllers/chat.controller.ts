import { IReqAuth } from '@/config/interface/shared.interface';
import Chat from '@/models/chat.model';
import Message from '@/models/message.model';
import ApiError from '@/utils/api-error';
import { NextFunction, Response, Request } from 'express';
import { io } from '@/index';

class ChatController {
	async getOrCreateChat(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const { user1: userId1, user2: userId2 } = req.query;
			if (![userId1, userId2].includes(req.user?._id)) {
				return next(
					new ApiError(
						403,
						"You don't have permission to perform this action"
					)
				);
			}

			const existingChat = await Chat.findOne({
				users: { $all: [userId1, userId2] },
			}).populate([
				{
					path: 'messages.message',
					select: '-__v',
				},
				{
					path: 'users',
					select: 'first_name last_name _id avatar medias',
				},
			]);

			if (existingChat) {
				return res.status(200).json({
					success: true,
					data: existingChat,
					message: 'Get or create chat successfully',
				});
			}

			const newChat = await Chat.create({ users: [userId1, userId2] });
			const detailChat = await newChat.populate([
				{
					path: 'messages.message',
					select: '-__v',
				},
				{
					path: 'users',
					select: 'first_name last_name _id avatar medias',
				},
			]);

			return res.status(200).json({
				success: true,
				data: detailChat,
				message: 'New chat successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async addMessageToChat(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const { content, user1: userId1, user2: userId2 } = req.body;
			if (![userId1, userId2].includes(req.user?._id)) {
				return next(
					new ApiError(
						403,
						"You don't have permission to perform this action"
					)
				);
			}

			let chat = await Chat.findOne({
				users: { $all: [req.body?.user1, req.body?.user2] },
			});

			if (!chat) {
				chat = await Chat.create({
					users: [userId1, userId2],
					messages: [],
				});
			}

			const newMessage = await Message.create({
				chat: chat?._id.toString(),
				content: content,
				owner: req.user?._id,
			});

			chat = await Chat.findOneAndUpdate(
				{
					users: { $all: [userId1, userId2] },
				},
				{
					$push: {
						messages: {
							message: newMessage._id.toString(),
						},
					},
				},
				{ new: true }
			).populate([
				{
					path: 'messages.message',
					select: '-__v',
				},
				{
					path: 'users',
					select: 'first_name last_name _id avatar medias',
				},
			]);

			// Socket.io
			io.to(`${newMessage.chat.toString()}`).emit(
				'createMessage',
				newMessage
			);

			return res.status(200).json({
				success: true,
				data: chat,
				message: 'Send message successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async editMessage(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const { content } = req.body;

			const message = await Message.findById(req.params?.id);
			if (!message || message.owner.toString() !== req.user?._id) {
				return next(
					new ApiError(
						403,
						"You don't have permission to perform this action"
					)
				);
			}

			const updatedMessage = await Message.findByIdAndUpdate(
				req.params.id,
				{ $set: { content: content } },
				{ new: true }
			);

			// Socket.io
			io.to(`${updatedMessage?.chat.toString()}`).emit(
				'updateMessage',
				updatedMessage
			);

			return res.status(200).json({
				success: true,
				data: updatedMessage,
				message: 'Update message successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}

	async deleteMessage(req: IReqAuth, res: Response, next: NextFunction) {
		try {
			const message = await Message.findById(req.params?.id);
			if (!message || message.owner.toString() !== req.user?._id) {
				return next(
					new ApiError(
						403,
						"You don't have permission to perform this action"
					)
				);
			}

			const chatId = message.chat.toString();
			await Chat.findOneAndUpdate(
				{ _id: chatId },
				{ $pull: { messages: { message: req.params?.id } } }
			);
			const deletedMessage = await Message.findOneAndDelete({
				_id: req.params?.id,
			});

			// Socket.io
			io.to(`${deletedMessage?.chat.toString()}`).emit(
				'deleteMessage',
				deletedMessage
			);

			return res.status(200).json({
				success: true,
				data: deletedMessage,
				message: 'Delete message successfully',
			});
		} catch (error) {
			console.log(error);
			return next(new ApiError());
		}
	}
}

export default new ChatController();
