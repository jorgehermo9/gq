"use client";

import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

// TODO: Add disabled variant to Slider

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
		units?: string;
	}
>(({ units = "", className, step, value, max, disabled, ...props }, ref) => (
	<div className={cn("flex flex-col gap-2", disabled && "opacity-50 pointer-events-none")}>
		<SliderPrimitive.Root
			ref={ref}
			className={cn("relative flex w-full touch-none select-none items-center", className)}
			value={value}
			step={step}
			max={max}
			{...props}
		>
			<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-accent-background">
				<SliderPrimitive.Range className="absolute h-full bg-foreground" />
			</SliderPrimitive.Track>
			<SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-foreground shadow-md bg-background cursor-pointer ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
		</SliderPrimitive.Root>
		<span className="text-xs">{`${value?.[0]} ${units}`}</span>
	</div>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
