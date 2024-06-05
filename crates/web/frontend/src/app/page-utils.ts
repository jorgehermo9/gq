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
	silent = true,
): Promise<Data> => {
	const toastId = silent
		? undefined
		: toast.loading(`Applying query to ${inputData.type.toUpperCase()}...`);
	try {
		const result: Data = await gqWorker.postMessage({
			query: inputQuery,
			data: inputData,
			outputType: outputType,
			indent: indent,
		});
		!silent &&
			toast.success(`Query applied to ${inputData.type.toUpperCase()}`, {
				id: toastId,
			});
		return result;
	} catch (err) {
		!silent &&
			toast.error(
				`Error while applying query to ${inputData.type.toUpperCase()}: ${err.message
				}`,
				{ id: toastId, duration: 5000 },
			);
		throw err;
	}
};

export const convertCode = async (
	data: Data,
	outputType: FileType,
	indent: number,
	convertWorker: PromiseWorker,
	silent = true,
): Promise<Data> => {
	const toastId = silent ? undefined : toast.loading("Converting code...");
	try {
		const result: Data = await convertWorker.postMessage({
			data: data,
			outputType: outputType,
			indent: indent,
		});
		!silent && toast.success("Code converted!", { id: toastId });
		return result;
	} catch (err) {
		!silent && toast.error(err.message, { id: toastId, duration: 5000 });
		throw err;
	}
};
