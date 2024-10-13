import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { motion, useSpring } from "framer-motion";
import { type MouseEvent, forwardRef, useEffect, useRef, useState } from "react";
import styles from "./button.module.css";

const buttonVariants = cva(
	"relative overflow-hidden inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 transition-opacity",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				error: "bg-error text-foreground hover:bg-error/90",
				success: "bg-success text-background",
				outline: "border border-accent-background bg-background",
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
	({ className, variant, size, onClick, asChild = false, disabled, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		const [isHover, setIsHover] = useState(false);
		const containerRef = useRef<HTMLDivElement | null>(null);
		const maxSize = Math.max(
			containerRef.current?.clientWidth ?? 0,
			containerRef.current?.clientHeight ?? 0,
		);
		const fillX = useSpring(0, { stiffness: 200, damping: 30 });
		const fillY = useSpring(0, { stiffness: 200, damping: 30 });

		const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
			const { left, top } = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
			const x = event.clientX - left;
			const y = event.clientY - top;
			fillX.set(x);
			fillY.set(y);
		};

		const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
			if (disabled) return;
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

		useEffect(() => {
			const { width, height } = containerRef.current?.getBoundingClientRect() ?? {
				width: 0,
				height: 0,
			};
			fillX.set(width / 2);
			fillY.set(height / 2);
		}, [fillX, fillY]);

		return (
			<div ref={containerRef}>
				<Comp
					className={cn(buttonVariants({ variant, size, className }))}
					ref={ref}
					onClick={handleClick}
					onMouseEnter={() => setIsHover(true)}
					onMouseLeave={() => setIsHover(false)}
					onMouseMove={handleMouseMove}
					{...props}
					disabled={disabled}
				>
					{!disabled && (
						<motion.div
							className="absolute inset-0 rounded-full pointer-events-none"
							style={{
								x: fillX,
								y: fillY,
								width: maxSize * 1.6,
								height: maxSize * 1.6,
							}}
							initial={{ opacity: 0 }}
							animate={{ opacity: isHover ? 0.1 : 0 }}
							transition={{ duration: 0.2 }}
						>
							<div
								className="absolute inset-0 -translate-x-1/2 -translate-y-1/2"
								style={{
									display: variant === "ghost" ? "none" : "block",
									backgroundImage: `radial-gradient(
								circle at 50% 50%,
								#eeefff,
								var(--accent) 20%,
								var(--background) 60%
							)`,
								}}
							/>
						</motion.div>
					)}
					{props.children}
				</Comp>
			</div>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
