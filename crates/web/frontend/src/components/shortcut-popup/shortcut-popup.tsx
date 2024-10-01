import { Keyboard, X } from "lucide-react";
import { useState } from "react";
import ActionButton from "../action-button/action-button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import Link from "../ui/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { shortcutSections } from "./shortcuts";

const ShortcutPopup = () => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton description="Show keyboard shortcuts" className="p-3">
					<Keyboard className="w-4 h-4" />
				</ActionButton>
			</DialogTrigger>
			<DialogContent className="w-[34rem] max-w-[80vw] max-h-[80vh] overflow-y-auto gap-0">
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
				{shortcutSections.map((shortcutSection) => (
					<div className="mt-8" key={shortcutSection.title}>
						<h3 className="font-semibold mb-1">{shortcutSection.title}</h3>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Description</TableHead>
									<TableHead className="text-right">Shortcut</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{shortcutSection.shortcuts.map((shortcut) => (
									<TableRow key={shortcut.description}>
										<TableCell className="text-sm">{shortcut.description}</TableCell>
										<TableCell className="text-right">
											<code className="py-1 text-sm">{shortcut.shortcut}</code>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				))}
				<div className="flex gap-1 justify-center items-center mt-3">
					<Link
						href="https://codemirror.net/5/doc/manual.html#commands"
						target="_blank"
						rel="noreferrer"
						className="hover:underline"
					>
						More editor-related shortcuts
					</Link>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ShortcutPopup;
