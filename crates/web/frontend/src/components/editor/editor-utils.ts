import type FileType from "@/model/file-type";
import { toast } from "sonner";
import type PromiseWorker from "webworker-promise";

export const exportFile = (
	value: string,
	fileName: string,
	fileType: FileType,
) => {
	const blob = new Blob([value], { type: `application/${fileType}` });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${fileName}.${fileType}`;
	a.click();
	URL.revokeObjectURL(url);
	toast.success("File exported succesfully!");
};

export const copyToClipboard = (value: string) => {
	navigator.clipboard.writeText(value);
	toast.success("Copied to your clipboard!");
};

export const formatCode = async (
	value: string,
	fileType: FileType,
	indentSize: number,
	formatWorker: PromiseWorker,
): Promise<string> => {
	const toastId = toast.loading("Formatting code...");
	try {
		const response = await formatWorker.postMessage({
			data: value,
			indent: indentSize,
			type: fileType,
		});
		toast.success("Code formatted!", { id: toastId });
		return response;
	} catch (err) {
		toast.error(err.message, { id: toastId, duration: 5000 });
		throw err;
	}
};
