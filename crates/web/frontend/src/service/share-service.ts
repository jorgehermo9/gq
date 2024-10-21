import { MAX_SHARE_SIZE } from "@/lib/constants";
import { ShareTooLargeError } from "@/model/errors/share-input-too-large-error";
import { type Share, ShareSchema } from "@/model/share";
import type { ZodSchema } from "zod";

const sharesEndpoint = "/api/shares";

export const getShare = async (shareId: string): Promise<Share> => {
	const res = await fetch(`${sharesEndpoint}/${shareId}`);
	return getBody(res, ShareSchema);
};

export const createShare = async (
	inputContent: string,
	queryContent: string,
	expirationTimeSecs: number,
): Promise<string> => {
	if (inputContent.length + queryContent.length > MAX_SHARE_SIZE) {
		throw new ShareTooLargeError();
	}
	const res = await fetch(sharesEndpoint, {
		method: "POST",
		body: JSON.stringify({ json: inputContent, query: queryContent, expirationTimeSecs }),
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data: { id: string } = await getBody(res);
	return data.id;
};

const getBody = async <T>(res: Response, schema?: ZodSchema<T>): Promise<T> => {
	try {
		const data = await res.json();
		if (!res.ok) throw new Error(data.message);
		if (schema) return schema.parse(data);
		return data;
	} catch (error) {
		if (error instanceof TypeError) throw new Error("Cannot reach server");
		throw error;
	}
};
