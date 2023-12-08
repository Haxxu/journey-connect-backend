import mongoose, { PaginateModel } from 'mongoose';
import Joi from 'joi';
import mongoosePaginate from 'mongoose-paginate-v2';

import { IMessage } from '@/config/interface/message.interface';

type MessageModel = mongoose.Model<IMessage, {}, {}>;

const messageSchema = new mongoose.Schema<IMessage, MessageModel, {}>(
	{
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		chat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Chat',
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

messageSchema.plugin(mongoosePaginate);

const Message = mongoose.model<IMessage, PaginateModel<IMessage>>(
	'Message',
	messageSchema
);

export default Message;
