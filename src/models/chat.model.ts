import mongoose, { PaginateModel } from 'mongoose';
import Joi from 'joi';
import mongoosePaginate from 'mongoose-paginate-v2';

import { IChat } from '@/config/interface/chat.interface';

type ChatModel = mongoose.Model<IChat, {}, {}>;

const chatSchema = new mongoose.Schema<IChat, ChatModel, {}>(
	{
		users: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
		],
		messages: [
			{
				message: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Message',
					required: true,
				},
				added_at: {
					type: Date,
					default: Date.now(),
				},
				_id: false,
			},
		],
	},
	{ timestamps: true }
);

chatSchema.plugin(mongoosePaginate);

const Chat = mongoose.model<IChat, PaginateModel<IChat>>('Chat', chatSchema);

export default Chat;
