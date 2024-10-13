import { ExpirationTime, toSeconds } from "@/model/expiration-time";
import { createShare } from "@/service/share-service";
import { toast } from "sonner";

export const createShareLink = async (
	inputContent: string,
	queryContent: string,
	expirationTime: ExpirationTime,
): Promise<string> => {
	try {
		const shareId = await createShare(inputContent, queryContent, toSeconds(expirationTime));
		toast.success("Share link created!");
		const shareLink = `${window.location.origin}?id=${shareId}`;
		return Promise.resolve(shareLink);
	} catch (err) {
		toast.error(`An error occurred while creating the share link: ${err.message}`);
		return Promise.reject(err);
	}
};
