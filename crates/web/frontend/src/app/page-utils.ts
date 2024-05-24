import type { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import { toast } from "sonner";
import type PromiseWorker from "webworker-promise";

export const applyGq = async (
	inputData: Data,
	inputQuery: Data,
	outputType: FileType,
	indent: number,
	gqWorker: PromiseWorker,
	silent = false,
): Promise<Data> => {
	const toastId = silent
		? undefined
		: toast.loading("Applying query to JSON...");
	try {
		const result = await gqWorker.postMessage({
			query: inputQuery.content,
			data: inputData,
			outputFileType: outputType,
			indent: indent,
		});
		!silent && toast.success("Query applied to JSON", { id: toastId });
		return {
			content: result,
			type: outputType,
		};
	} catch (err) {
		!silent &&
			toast.error(`Error while applying query to JSON: ${err.message}`, {
				id: toastId,
				duration: 5000,
			});
		throw err;
	}
};

export const convertCode = async (
	data: Data,
	outputType: FileType,
	indent: number,
	convertWorker: PromiseWorker,
): Promise<Data> => {
	const toastId = toast.loading("Converting code...");
	try {
		const response = await convertWorker.postMessage({
			data: data,
			outputType: outputType,
			indent: indent,
		});
		toast.success("Code converted!", { id: toastId });
		return {
			content: response,
			type: outputType,
		};
	} catch (err) {
		toast.error(err.message, { id: toastId, duration: 5000 });
		throw err;
	}
};
