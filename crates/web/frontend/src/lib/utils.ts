import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { notify } from "./notify";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatBytes(bytes: number, decimals = 2) {
	if (!+bytes) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
}

export function formatNumber(number: number, decimals = 1) {
	if (!+number) throw new Error("Invalid number");
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["", "K", "M", "B", "T", "Q"];
	const i = Math.floor(Math.log(number) / Math.log(1000));
	return `${Number.parseFloat((number / 1000 ** i).toFixed(dm))}${sizes[i]}`;
}

export const isMac = navigator.platform.includes("Mac"); // Deprecated navigator.platform

export const copyToClipboard = (content: string) => {
	navigator.clipboard.writeText(content);
	notify.success("Copied to your clipboard!");
};

export const countLines = (text: string) => {
	return text.split("\n").length;
};

export const statusTextMap = new Map([
	[200, "OK"],
	[201, "Created"],
	[202, "Accepted"],
	[203, "Non-Authoritative Information"],
	[204, "No Content"],
	[205, "Reset Content"],
	[206, "Partial Content"],
	[300, "Multiple Choices"],
	[301, "Moved Permanently"],
	[302, "Found"],
	[303, "See Other"],
	[304, "Not Modified"],
	[305, "Use Proxy"],
	[306, "Unused"],
	[307, "Temporary Redirect"],
	[400, "Bad Request"],
	[401, "Unauthorized"],
	[402, "Payment Required"],
	[403, "Forbidden"],
	[404, "Not Found"],
	[405, "Method Not Allowed"],
	[406, "Not Acceptable"],
	[407, "Proxy Authentication Required"],
	[408, "Request Timeout"],
	[409, "Conflict"],
	[410, "Gone"],
	[411, "Length Required"],
	[412, "Precondition Required"],
	[413, "Request Entry Too Large"],
	[414, "Request-URI Too Long"],
	[415, "Unsupported Media Type"],
	[416, "Requested Range Not Satisfiable"],
	[417, "Expectation Failed"],
	[418, "I'm a teapot"],
	[429, "Too Many Requests"],
	[500, "Internal Server Error"],
	[501, "Not Implemented"],
	[502, "Bad Gateway"],
	[503, "Service Unavailable"],
	[504, "Gateway Timeout"],
	[505, "HTTP Version Not Supported"],
]);

export const i = () => {};
