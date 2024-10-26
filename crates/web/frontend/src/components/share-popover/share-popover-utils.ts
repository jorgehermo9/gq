import { notify } from "@/lib/notify";
import { ShareTooLargeError } from "@/model/errors/share-input-too-large-error";
import { type ExpirationTime, toSeconds } from "@/model/expiration-time";
import type FileType from "@/model/file-type";
import { createShare } from "@/services/shares/share-service";

export const createShareLink = async (
	inputContent: string,
	inputType: FileType,
	queryContent: string,
	outputType: FileType,
	expirationTime: ExpirationTime,
): Promise<string | undefined> => {
	try {
		const shareId = await createShare({
			inputContent,
			inputType,
			queryContent,
			outputType,
			expirationTimeSecs: toSeconds(expirationTime),
		});
		notify.success("Share link created!");
		const shareLink = `${window.location.origin}?id=${shareId}`;
		return Promise.resolve(shareLink);
	} catch (err) {
		if (err instanceof ShareTooLargeError) {
			notify.error(err.message);
		} else {
			notify.error(`Unexpected error while creating the share link: ${err.message}`);
		}
	}
};
