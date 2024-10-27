"use client";

import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

const SliderWithMarks = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
		marks: string[];
	}
>(({ marks, className, value, disabled, ...props }, ref) => {
	const max = marks.length - 1;
	return (
		<div className={cn("flex flex-col gap-2", disabled && "opacity-50 pointer-events-none")}>
			<SliderPrimitive.Root
				ref={ref}
				className={cn("relative flex w-full touch-none select-none items-center mt-4", className)}
				value={value}
				max={max}
				{...props}
			>
				<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-accent-background">
					<SliderPrimitive.Range className="absolute h-full bg-foreground" />
				</SliderPrimitive.Track>
				<SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-foreground shadow-md bg-background cursor-pointer ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
				<div className="absolute w-[96%] right-1/2 translate-x-1/2 -z-10">
					{marks.map((mark, index) => (
						<div
							key={mark}
							className={`absolute top-full mt-2 left-[${(index / max) * 100}%] -translate-x-1/2 w-max`}
						>
							<span
								className={cn(
									"text-xs transition-opacity text-foreground opacity-50",
									index === value?.[0] && "opacity-100",
								)}
							>
								{mark}
							</span>
						</div>
					))}
				</div>
			</SliderPrimitive.Root>
		</div>
	);
});
SliderWithMarks.displayName = "SliderWithMarks";

export { SliderWithMarks };
