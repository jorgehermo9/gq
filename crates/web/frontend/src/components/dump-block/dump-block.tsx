import { cn } from "@/lib/utils";
import ActionButton from "../action-button/action-button";
import { Redo, Trash } from "lucide-react";
import { notify } from "@/lib/notify";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
	onDump: () => void;
	onDumpMessage?: string;
	lines: number;
	onDelete?: () => void;
	onDeleteMessage?: string;
}

export const DumpBlock = ({
	onDump,
	onDumpMessage,
	lines,
	onDelete,
	onDeleteMessage,
	children,
	className,
	...props
}: Props) => {
	const handleDump = () => {
		onDumpMessage && notify.success(onDumpMessage);
		onDump();
	};

	const handleDelete = () => {
		onDeleteMessage && notify.success(onDeleteMessage);
		onDelete?.();
	};

	return (
		<div className={cn("relative group flex justify-between", className)} {...props}>
			{children}
			<div
				className={cn(
					"max-w-0 transition-all",
					lines > 2 ? "group-hover:max-w-10" : "group-hover:max-w-20 flex",
				)}
			>
				<ActionButton
					side={lines > 2 ? "right" : "bottom"}
					containerClassName={cn(
						"min-h-10 flex items-center justify-center border-l",
						lines > 2 && onDelete ? "h-1/2 border-b" : "h-full",
					)}
					className="h-full w-10 border-0"
					description="Dump content into the editor"
					onClick={handleDump}
				>
					<Redo className="w-3 h-3" />
				</ActionButton>
				{onDelete && (
					<ActionButton
						side={lines > 2 ? "right" : "bottom"}
						containerClassName={cn(
							"min-h-10 flex items-center justify-center border-l",
							lines > 2 ? "h-1/2" : "h-full",
						)}
						className="h-full w-10 border-0"
						description="Delete from history"
						onClick={handleDelete}
					>
						<Trash className="w-3 h-3" />
					</ActionButton>
				)}
			</div>
		</div>
	);
};
