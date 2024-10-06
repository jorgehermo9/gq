import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";
import { useCallback } from "react";
import { Input } from "../ui/input";
import HeadersDatalist from "./headers-datalist";
import { Checkbox } from "../ui/checkbox";

interface HeadersTabProps {
	headers: [string, string, boolean][];
	setHeaders: (headers: [string, string, boolean][]) => void;
}

const HeadersTab = ({ headers, setHeaders }: HeadersTabProps) => {
	const updateHeaders = useCallback(
		(index: number, key: string, value: string, enabled: boolean) => {
			const newHeaders: [string, string, boolean][] = headers.map((header, i) =>
				i === index ? [key, value, enabled] : header,
			);
			if (index === headers.length - 1 && (key || value)) {
				newHeaders.push(["", "", true]);
			}
			setHeaders(newHeaders);
		},
		[headers, setHeaders],
	);

	const deleteHeaders = useCallback(
		(index: number) => {
			if (headers.length === 1) {
				setHeaders([["", "", true]]);
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
					<Checkbox
						checked={header[2]}
						onCheckedChange={(checked) =>
							checked !== "indeterminate" && updateHeaders(index, header[0], header[1], checked)
						}
						className="peer"
					/>
					<Input
						type="text"
						placeholder="Header"
						value={header[0]}
						list="header-list"
						onChange={(e) => updateHeaders(index, e.target.value, header[1], header[2])}
						className="w-1/2 p-2 border rounded-md mb-0 peer-data-[state=unchecked]:opacity-50 transition-opacity"
					/>
					<HeadersDatalist id="header-list" />
					<Input
						type="text"
						placeholder="Value"
						value={header[1]}
						onChange={(e) => updateHeaders(index, header[0], e.target.value, header[2])}
						className="w-1/2 p-2 border rounded-md mb-0 peer-data-[state=unchecked]:opacity-50 transition-opacity"
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
			{/* <Button className="block mx-auto mt-2 px-2 py-2 text-xs h-auto" variant="outline">
				Delete all
			</Button> */}
		</div>
	);
};

export default HeadersTab;
