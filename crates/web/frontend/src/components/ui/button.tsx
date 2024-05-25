import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import styles from "./button.module.css";

const buttonVariants = cva(
	"relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				error: "bg-error text-foreground hover:bg-error/90",
				success: "bg-success text-background hover:bg-success/90",
				outline: "border border-accent-background bg-background",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
	VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, onClick, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";

		const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
			if (variant === "ghost") return onClick?.(e);
			const ripple = document.createElement("span");
			const rect = e.currentTarget.getBoundingClientRect();
			const size = Math.max(rect.width, rect.height);
			const x = e.clientX - rect.left - size / 2;
			const y = e.clientY - rect.top - size / 2;

			ripple.style.width = ripple.style.height = `${size}px`;
			ripple.style.left = `${x}px`;
			ripple.style.top = `${y}px`;
			ripple.classList.add(styles.ripple);

			e.currentTarget.prepend(ripple);

			setTimeout(() => ripple.remove(), 1000);
			onClick?.(e);
		};

		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				onClick={handleClick}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
