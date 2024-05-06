import { toast } from "sonner";
import type PromiseWorker from "webworker-promise";

export const applyGq = async (
	inputJson: string,
	inputQuery: string,
	tabSize: number,
	gqWorker: PromiseWorker,
): Promise<string> => {
	const toastId = toast.loading("Applying query to JSON...");
	try {
		const result = await gqWorker.postMessage({
			query: inputQuery,
			json: inputJson,
			indent: tabSize,
		});
		toast.success("Query applied to JSON", { id: toastId });
		return result;
	} catch (err) {
		toast.error("Error while applying query to JSON", {
			id: toastId,
			duration: 5000,
		});
		throw err;
	}
};
