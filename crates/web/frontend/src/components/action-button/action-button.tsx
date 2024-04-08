import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

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
	...props
}: Props) => {
	return (
		<HoverCard openDelay={800}>
			<HoverCardTrigger>
				<Button
					className={cn("w-fit h-fit", className)}
					variant="outline"
					size="icon"
					disabled={disabled}
					{...props}
				>
					{children}
				</Button>
			</HoverCardTrigger>
			<HoverCardContent side={side} className="max-w-96 w-fit text-sm p-2">
				{description}
			</HoverCardContent>
		</HoverCard>
	);
};

export default ActionButton;
