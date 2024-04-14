import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	description: string;
	side?: "top" | "bottom" | "left" | "right";
	disabled?: boolean;
	children?: React.ReactNode;
	className?: string;
}

const ActionButton = ({
	description,
	side = "bottom",
	disabled = false,
	children,
	className,
	hidden,
	...props
}: Props) => {
	return (
		!hidden && (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							className={cn("w-fit h-fit", className)}
							variant="outline"
							size="icon"
							disabled={disabled}
							{...props}
						>
							{children}
						</Button>
					</TooltipTrigger>
					<TooltipContent side={side} className="max-w-96 w-fit text-sm p-2">
						{description}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		)
	);
};

export default ActionButton;
