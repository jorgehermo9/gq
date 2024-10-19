import { notify } from "@/lib/notify";
import { ShareTooLargeError } from "@/model/errors/share-input-too-large-error";
import { type ExpirationTime, toSeconds } from "@/model/expiration-time";
import { createShare } from "@/service/share-service";

export const createShareLink = async (
	inputContent: string,
	queryContent: string,
	expirationTime: ExpirationTime,
): Promise<string> => {
	try {
		const shareId = await createShare(inputContent, queryContent, toSeconds(expirationTime));
		notify.success("Share link created!");
		const shareLink = `${window.location.origin}?id=${shareId}`;
		return Promise.resolve(shareLink);
	} catch (err) {
		if (err instanceof ShareTooLargeError) {
			notify.error(err.message);
		} else {
			notify.error(`Unexpected error while creating the share link: ${err.message}`);
		}
		return Promise.reject(err);
	}
};
