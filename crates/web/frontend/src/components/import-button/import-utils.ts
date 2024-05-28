import { toast } from "sonner";

export const importFile = (file: File, callback: (data: string) => void) => {
	const reader = new FileReader();
	reader.onload = () => {
		const content = reader.result as string;
		toast.success("File imported!");
		callback(content);
	};
	reader.readAsText(file);
};

export const importUrl = async (
	url: string,
	callback: (content: string) => void,
) => {
	const toastId = toast.loading("Importing file...");
	try {
		const res = await fetch(url);
		if (res.status !== 200) {
			throw new Error(`Received ${res.status}`);
		}
		const content = await res.text();
		toast.success("File imported!", { id: toastId });
		callback(content);
	} catch (err) {
		toast.error(`Failed to import file: ${err.message}`, {
			id: toastId,
			duration: 5000,
		});
	}
};
