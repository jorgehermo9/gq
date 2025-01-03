import { isMac } from "@/lib/utils";
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

interface Props {
	className?: string;
}

const ShortcutPopup = ({ className }: Props) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton
					className={className}
					description="Show keyboard shortcuts"
					side="top"
					variant="subtle"
				>
					<Keyboard className="w-3.5 h-3.5" />
				</ActionButton>
			</DialogTrigger>
			<DialogContent className="w-[38rem] max-w-[80vw] max-h-[80vh] overflow-y-auto gap-0 pb-6">
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
				<div className="flex flex-col gap-8">
					{shortcutSections(isMac).map((shortcutSection) => (
						<div key={shortcutSection.title}>
							<div className="flex py-4 px-6 gap-2 items-center">
								{shortcutSection.icon}
								<h4 className="font-semibold">{shortcutSection.title}</h4>
							</div>
							<Table>
								<TableHeader>
									<TableRow className="text-accent">
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
				</div>
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
