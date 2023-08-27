import mongoose, { ConnectOptions } from 'mongoose';

class Database {
	connect(url?: string): void {
		const connectionParams = {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		};

		try {
			mongoose.set('strictQuery', false);
			mongoose
				.connect(`${url}`, connectionParams as ConnectOptions)
				.then((db) => {
					db.connection.on('error', (err) => {
						console.error(err);
					});
					db.connection.on('disconnected', () => {
						console.log('Database disconnected.');
					});
					db.connection.on('reconnected', () => {
						console.log('Database reconnected.');
					});
				});
			console.log('Connect to database successfully');
		} catch (error: any) {
			console.log(error.message);
			console.log('Connect to database failure');
		}
	}
}

export default new Database();
