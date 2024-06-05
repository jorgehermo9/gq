import { Data } from "@/model/data";
import { toast } from "sonner";

export const imporFile = (file: File, silent = true): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const content = reader.result as string;
			!silent && toast.success("File imported!");
			resolve(content);
		};
		reader.onerror = () => {
			!silent && toast.error(`Failed to import file: ${reader.error.message}`, { duration: 5000 });
			reject(reader.error);
		}
		reader.readAsText(file);
	});
}

export const importUrl = (url: string, silent = true): Promise<string> => {
	return new Promise((resolve, reject) => {
		const toastId = silent ? undefined : toast.loading("Importing file...");
		fetch(url)
			.then(res => {
				if (res.status !== 200) {
					reject(new Error(`Received ${res.status}`));
				}
				return res.text();
			})
			.then(content => {
				!silent && toast.success("File imported!", { id: toastId });
				resolve(content);
			})
			.catch(err => {
				!silent && toast.error(`Failed to import file: ${err.message}`, {
					id: toastId,
					duration: 5000,
				});
				reject(err);
			});
	});
}
