import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, readOnly, disabled, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex cursor-text h-10 w-full mb-2 border valid:border-input invalid:border-error focus-visible:border-accent bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none transition-colors",
					disabled && "cursor-not-allowed opacity-50",
					className,
				)}
				ref={ref}
				disabled={disabled || readOnly}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
