import { storage } from '@/database/firebase';
import Media from '@/models/media.model';
import Post from '@/models/post.model';
import { deleteObject, ref } from 'firebase/storage';

interface IMedia {
	id: string;
	type: string;
	url: string;
	action?: string;
}

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

			if (result.matchedCount > 0) {
				const updatedDocuments = await Media.find(
					{
						_id: { $in: files },
						owner,
						verified: true,
					},
					'_id'
				);
				const updatedIds = updatedDocuments.map((doc) =>
					doc._id.toString()
				);
				return updatedIds;
			} else {
				return [];
			}

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

			return mediaIdsToDelete;

			// console.log(
			// 	`${result.deletedCount} documents deleted and corresponding files in Firebase Storage.`
			// );
		} catch (error) {
			console.error('Error deleting documents:', error);
		}
	}

	// Type = post/
	static async updateMedias(
		type: string = 'post',
		owner: string,
		currentMedias: Array<IMedia>,
		newMedias: Array<IMedia>
	) {
		try {
			const currentMediaIds = currentMedias.map((media) => media.id);
			const newMediaIds = newMedias.map((media) => media.id);

			const deleteMediaIds = findStringsNotInNewArray(
				currentMediaIds,
				newMediaIds
			);
			const verifyMediaIds = findNewStrings(currentMediaIds, newMediaIds);

			const addedIds = await this.verifyFiles(verifyMediaIds, owner);
			const deletedIds = await this.deleteFiles(deleteMediaIds, owner);

			const updatedMedias = newMedias.filter(
				(media) =>
					currentMediaIds.includes(media.id) ||
					addedIds?.includes(media.id)
			);

			return updatedMedias;

			// return [];
		} catch (error) {
			console.error('Error deleting documents:', error);
		}
	}
}

function findStringsNotInNewArray(
	currentArr: string[],
	newArray: string[]
): string[] {
	const notInNewArray = currentArr.filter((item) => !newArray.includes(item));

	return notInNewArray;
}

function findNewStrings(currentArr: string[], newArr: string[]): string[] {
	const newValues = newArr.filter((item) => !currentArr.includes(item));

	return newValues;
}

function findNewIds(currentArr: any[], newArr: any[]): string[] {
	const currentIdsSet = new Set(currentArr.map((media) => media.id));

	const newIds = newArr
		.filter((media) => !currentIdsSet.has(media.id))
		.map((media) => media.id);

	return newIds;
}

export default MediaService;
