import { Keyboard, X } from "lucide-react";
import ActionButton from "../action-button/action-button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const ShortcutPopup = () => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton description="Show keyboard shortcuts" className="p-3">
					<Keyboard className="w-4 h-4" />
				</ActionButton>
			</DialogTrigger>
			<DialogContent className="w-[34rem] max-w-[80vw]">
				<X
					className="absolute top-4 right-4 h-4 w-4 cursor-pointer"
					onClick={() => setOpen(false)}
				/>
				<DialogHeader>
					<DialogTitle>Playground shortcuts</DialogTitle>
					<DialogDescription>
						Check all available keyboard shortcuts to improve your efficiency
					</DialogDescription>
				</DialogHeader>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="">Description</TableHead>
							<TableHead className="text-right">Shortcut</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="text-sm">Apply the current query</TableCell>
							<TableCell className="text-right">
								<code className="">Alt + Enter</code>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="text-sm">Format the content of the focused editor</TableCell>
							<TableCell className="text-right">
								<code className="">Ctrl + S</code>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="text-sm">Show autocompletions inside GQ editor</TableCell>
							<TableCell className="text-right">
								<code className="">Ctrl + .</code>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</DialogContent>
		</Dialog>
	);
};

export default ShortcutPopup;
