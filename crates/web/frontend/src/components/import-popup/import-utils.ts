import { statusTextMap } from "@/lib/utils";
import { toast } from "sonner";

export const importFile = (file: File, silent = true): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const content = reader.result as string;
			!silent && toast.success("File imported!");
			resolve(content);
		};
		reader.onerror = () => {
			!silent &&
				reader.error &&
				toast.error(`Failed to import file: ${reader.error.message}`, {
					duration: 5000,
				});
			reject(reader.error);
		};
		reader.readAsText(file);
	});
};

export const importUrl = async (url: string, httpMethod: string, headers: [string,string][], silent = true): Promise<string> => {
	const toastId = silent ? undefined : toast.loading("Importing file...");
	try {
		const response = await fetch(url, {
			method: httpMethod,
			headers: headers
		});
		if (!response.ok) {
			throw new Error(`Received ${response.status} (${statusTextMap.get(response.status)})`);
		}
		const content = await response.text();
		!silent && toast.success("File imported!", { id: toastId });
		return content;
	} catch (err) {
		!silent &&
			toast.error(`Failed to import file: ${err.message}`, {
				id: toastId,
				duration: 5000,
			});
		throw err;
	}
};
