import { storage } from '@/database/firebase';
import Media from '@/models/media.model';
import Post from '@/models/post.model';
import { deleteObject, ref } from 'firebase/storage';

class MediaService {
	id?: string;

	constructor(id: string) {
		this.id = id;
	}

	static async verifyFiles(files: Array<any>, owner: string) {
		try {
			const result = await Media.updateMany(
				{
					_id: { $in: files },
					owner,
				},
				{ $set: { verified: true } }
			);

			// console.log(`${result.matchedCount} documents updated.`);
		} catch (error) {
			console.error('Error updating documents:', error);
		}
	}

	static async deleteFiles(files: Array<any>, owner: string) {
		try {
			const mediaToDelete = await Media.find({
				_id: { $in: files },
				owner,
			}).select('_id path');

			const mediaIdsToDelete = mediaToDelete.map((media) =>
				media._id.toString()
			);
			const mediaPathsToDelete = mediaToDelete.map((media) => media.path);

			const result = await Media.deleteMany({
				_id: { $in: mediaIdsToDelete },
				owner,
			});

			for (const filePath of mediaPathsToDelete) {
				const fileRef = ref(storage, filePath);
				await deleteObject(fileRef);
			}

			// console.log(
			// 	`${result.deletedCount} documents deleted and corresponding files in Firebase Storage.`
			// );
		} catch (error) {
			console.error('Error deleting documents:', error);
		}
	}
}

export default MediaService;
