import { z } from "zod";

export type Share = {
	id: string;
	json: string;
	query: string;
};

export const ShareSchema = z.object({
	id: z.string().uuid(),
	json: z.string(),
	query: z.string(),
});
