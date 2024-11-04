import { cn } from "@/lib/utils";
import { Trash } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import RequestHeadersDatalist from "./request-headers-datalist";

interface RequestHeadersTabProps {
	headers: [string, string, boolean][];
	setHeaders: (headers: [string, string, boolean][]) => void;
}

const RequestHeadersTab = ({ headers, setHeaders }: RequestHeadersTabProps) => {
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
		<div className="flex flex-col gap-2 overflow-y-auto">
			{headers.map((header, index) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: This is a controlled list
					key={index}
					className="flex items-center group overflow-x-hidden"
				>
					<Checkbox
						checked={header[2]}
						onCheckedChange={(checked) =>
							checked !== "indeterminate" && updateHeaders(index, header[0], header[1], checked)
						}
						className="w-4 peer mr-4"
					/>
					<Input
						style={{ minWidth: "calc(50% - 1rem)" }}
						type="text"
						placeholder="Header"
						value={header[0]}
						list="header-list"
						onChange={(e) => updateHeaders(index, e.target.value, header[1], header[2])}
						className="w-1/2 p-2 border mb-0 peer-data-[state=unchecked]:opacity-50 transition-opacity"
					/>
					<RequestHeadersDatalist id="header-list" />
					<Input
						type="text"
						placeholder="Value"
						value={header[1]}
						onChange={(e) => updateHeaders(index, header[0], e.target.value, header[2])}
						className="w-1/2 p-2 border mb-0 peer-data-[state=unchecked]:opacity-50 transition-opacity"
					/>
					<div
						className={cn(
							"max-w-0 group-hover:max-w-10 transition-all peer-data-[state=unchecked]:opacity-50",
							index === headers.length - 1 && !header[0] && !header[1] && "hidden",
						)}
					>
						<Button
							className="h-10 w-10 p-0 border-l-0 transition-opacity opacity-100"
							variant="outline"
							onClick={() => deleteHeaders(index)}
						>
							<Trash className={cn("h-3 w-3")} />
						</Button>
					</div>
				</div>
			))}
			{/* <Button className="block mx-auto mt-2 px-2 py-2 text-xs h-auto" variant="outline">
				Delete all
			</Button> */}
		</div>
	);
};

export default RequestHeadersTab;
