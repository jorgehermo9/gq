import { Trash, X } from "lucide-react";
import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import HeadersDatalist from "../headers-datalist/headers-datalist";

interface HeadersPopupProps {
	headers: [string, string][];
	setHeaders: (headers: [string, string][]) => void;
}

const HeadersPopup = ({ headers, setHeaders }: HeadersPopupProps) => {
	const [open, setOpen] = useState(false);

	const updateHeaders = (index: number, key: string, value: string) =>
		setHeaders(headers.map((header, i) => (i === index ? [key, value] : header)));

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<span className="text-xs cursor-pointer">+ Headers</span>
			</DialogTrigger>
			<DialogContent className="w-[34rem] max-w-[80vw] max-h-[60vh] overflow-y-auto gap-0">
				<X
					className="absolute top-4 right-4 h-4 w-4 cursor-pointer"
					onClick={() => setOpen(false)}
				/>
				<DialogHeader>
					<DialogTitle>Request Headers</DialogTitle>
					<DialogDescription>Customize the headers for the import request</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4 mt-8">
					{headers.map((header, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
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
								className="h-4 w-4 cursor-pointer text-error"
								onClick={() => setHeaders(headers.filter((_, i) => i !== index))}
							/>
						</div>
					))}
					<Button
						onClick={() => setHeaders([...headers, ["", ""]])}
						className="py-1 px-8"
						variant="outline"
						type="button"
					>
						Add Header
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default HeadersPopup;
