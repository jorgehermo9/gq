import { toast } from "sonner";
import type PromiseWorker from "webworker-promise";

export const applyGq = async (
	inputJson: string,
	inputQuery: string,
	tabSize: number,
	gqWorker: PromiseWorker,
	silent = false,
): Promise<string> => {
	const toastId = silent
		? undefined
		: toast.loading("Applying query to JSON...");
	try {
		const result = await gqWorker.postMessage({
			query: inputQuery,
			json: inputJson,
			indent: tabSize,
		});
		!silent && toast.success("Query applied to JSON", { id: toastId });
		return result;
	} catch (err) {
		!silent &&
			toast.error("Error while applying query to JSON", {
				id: toastId,
				duration: 5000,
			});
		throw err;
	}
};
