import { Trash } from "lucide-react";
import HeadersDatalist from "../headers-datalist/headers-datalist";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface HeadersTabProps {
	headers: [string, string][];
	setHeaders: (headers: [string, string][]) => void;
}

const HeadersTab = ({ headers, setHeaders }: HeadersTabProps) => {
	const updateHeaders = (index: number, key: string, value: string) =>
		setHeaders(headers.map((header, i) => (i === index ? [key, value] : header)));

	const countHeaders = headers.reduce((acc, [key, value]) => (key || value ? acc + 1 : acc), 0);

	return (
		<div className="flex flex-col gap-4 pr-4">
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
						className="h-4 w-4 cursor-pointer"
						onClick={() => setHeaders(headers.filter((_, i) => i !== index))}
					/>
				</div>
			))}
			<Button
				onClick={() => setHeaders([...headers, ["", ""]])}
				className="py-1 px-4"
				variant="outline"
				type="button"
			>
				Add header
			</Button>
		</div>
	);
};

export default HeadersTab;
