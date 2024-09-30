import { Trash } from "lucide-react";
import HeadersDatalist from "../headers-datalist/headers-datalist";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface HeadersTabProps {
	headers: [string, string][];
	setHeaders: (headers: [string, string][]) => void;
}

const HeadersTab = ({ headers, setHeaders }: HeadersTabProps) => {
	const updateHeaders = useCallback(
		(index: number, key: string, value: string) => {
			const newHeaders: [string, string][] = headers.map((header, i) =>
				i === index ? [key, value] : header,
			);
			if (index === headers.length - 1 && (key || value)) {
				newHeaders.push(["", ""]);
			}
			setHeaders(newHeaders);
		},
		[headers, setHeaders],
	);

	const deleteHeaders = useCallback(
		(index: number) => {
			if (headers.length === 1) {
				setHeaders([["", ""]]);
				return;
			}
			setHeaders(headers.filter((_, i) => i !== index));
		},
		[headers, setHeaders],
	);

	return (
		<div className="flex flex-col pr-4 gap-2">
			{headers.map((header, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: This is a controlled list
					key={index}
					className="flex gap-4 items-center"
				>
					<Input
						type="text"
						placeholder="Header"
						value={header[0]}
						list="header-list"
						onChange={(e) => updateHeaders(index, e.target.value, header[1])}
						className="w-1/2 p-2 border rounded-md mb-0"
					/>
					<HeadersDatalist id="header-list" />
					<Input
						type="text"
						placeholder="Value"
						value={header[1]}
						onChange={(e) => updateHeaders(index, header[0], e.target.value)}
						className="w-1/2 p-2 border rounded-md mb-0"
					/>
					<Trash
						className={cn(
							"h-4 w-4 cursor-pointer pointer-events-auto transition-opacity opacity-100",
							index === headers.length - 1 &&
								!header[0] &&
								!header[1] &&
								"opacity-0 pointer-events-none",
						)}
						onClick={() => deleteHeaders(index)}
					/>
				</div>
			))}
		</div>
	);
};

export default HeadersTab;
