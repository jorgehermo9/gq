import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import styles from "./button.module.css";
import { useEffect, useRef, useState, MouseEvent, forwardRef } from "react";
import { motion, useSpring } from "framer-motion";

const buttonVariants = cva(
	"relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				error: "bg-error text-foreground hover:bg-error/90",
				success: "bg-success text-background hover:bg-success/90",
				outline: "border border-accent-background",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, onClick, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		const [isHover, setIsHover] = useState(false);
		const fillX = useSpring(50);
		const fillY = useSpring(50);
		const containerRef = useRef<HTMLButtonElement | null>(null);

		const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
			const { left, top } = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
			const x = event.clientX - left;
			const y = event.clientY - top;
			fillX.set(x);
			fillY.set(y);
		};

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
				ref={containerRef}
				onClick={handleClick}
				onMouseEnter={() => setIsHover(true)}
				onMouseLeave={() => setIsHover(false)}
				onMouseMove={handleMouseMove}
				{...props}
			>
				{props.children}
				<motion.div
					className="absolute inset-0 -z-10 rounded-full pointer-events-none"
					style={{
						x: fillX,
						y: fillY,
						width:
							Math.max(
								containerRef.current?.clientWidth ?? 0,
								containerRef.current?.clientHeight ?? 0,
							) * 1.6,
						height:
							Math.max(
								containerRef.current?.clientWidth ?? 0,
								containerRef.current?.clientHeight ?? 0,
							) * 1.6,
					}}
					animate={{ opacity: isHover ? 0.2 : 0 }}
				>
					<div
						className="absolute inset-0 -translate-x-1/2 -translate-y-1/2"
						style={{
							display: variant === "ghost" ? "none" : "block",
							backgroundImage: `radial-gradient(
								circle at 50% 50%,
								#ffffff,
								var(--accent) 20%,
								var(--background) 60%
							)`,
						}}
					/>
				</motion.div>
			</Comp>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
