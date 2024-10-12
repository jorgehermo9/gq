import { type Share, ShareSchema } from "@/model/share";

const sharesEndpoint = "/api/shares";

export const getShare = async (shareId: string): Promise<Share> => {
	const res = await fetch(`${sharesEndpoint}/${shareId}`);
	const data = await res.json();
	if (!res.ok) throw new Error(data.detail);
	return ShareSchema.parse(data);
};

export const createShare = async (
	json: string,
	query: string,
	expirationTimeSecs: number,
): Promise<string> => {
	const res = await fetch(sharesEndpoint, {
		method: "POST",
		body: JSON.stringify({ json, query, expirationTimeSecs: expirationTimeSecs }),
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.detail);
	return data.id;
};
