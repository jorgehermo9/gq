import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

interface Props extends ButtonProps {
	description: string;
	side?: "top" | "bottom" | "left" | "right";
	disabled?: boolean;
	children?: React.ReactNode;
	className?: string;
}

const ActionButton = React.forwardRef<HTMLButtonElement, Props>(
	(
		{
			description,
			side = "bottom",
			disabled = false,
			children,
			className,
			hidden,
			variant = "outline",
			...props
		},
		ref,
	) => {
		return (
			!hidden && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								className={cn("w-fit h-fit", className)}
								variant={variant}
								size="icon"
								disabled={disabled}
								{...props}
								ref={ref}
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
	},
);
ActionButton.displayName = "ActionButton";

export default ActionButton;
