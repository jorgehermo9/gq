import { Share, ShareSchema } from "@/model/share";

const endpoint = "/api";

export const getShare = (shareId: string): Promise<Share> => {
	return fetch(`${endpoint}/shares/${shareId}`)
		.then((res) => res.json())
		.then((data) => {
			if (data.detail) {
				throw new Error(data.detail);
			}
			return ShareSchema.parse(data);
		});
};

export const createShare = (
	json: string,
	query: string,
	expirationTime: number,
): Promise<string> => {
	return fetch(`${endpoint}/shares`, {
		method: "POST",
		body: JSON.stringify({ json, query, expirationTimeSecs: expirationTime }),
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.detail) {
				throw new Error(data.detail);
			}
			return data.id;
		});
};
