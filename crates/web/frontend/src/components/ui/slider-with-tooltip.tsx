"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { type ComponentPropsWithoutRef, forwardRef, useCallback, useEffect, useState } from "react";

const SliderWithTooltip = forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
		showTooltip?: boolean;
	}
>(({ className, showTooltip = true, onValueChange, disabled, ...props }, ref) => {
	const [value, setValue] = useState<number[]>((props.defaultValue as number[]) ?? [0]);
	const [showTooltipState, setShowTooltipState] = useState(false);

	const handlePointerDown = useCallback(() => {
		setShowTooltipState(true);
	}, []);

	const handlePointerUp = useCallback(() => {
		setShowTooltipState(false);
	}, []);

	useEffect(() => {
		document.addEventListener("pointerup", handlePointerUp);
		return () => {
			document.removeEventListener("pointerup", handlePointerUp);
		};
	}, [handlePointerUp]);

	return (
		<div className={cn("flex flex-col gap-2", disabled && "opacity-50 pointer-events-none")}>
			<SliderPrimitive.Root
				ref={ref}
				className={cn("relative flex w-full touch-none select-none items-center mt-4", className)}
				onValueChange={(e) => {
					setValue(e);
					onValueChange?.(e);
				}}
				onPointerDown={handlePointerDown}
				disabled={disabled}
				{...props}
			>
				<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-accent-background">
					<SliderPrimitive.Range className="absolute h-full bg-foreground" />
				</SliderPrimitive.Track>
				<Tooltip open={showTooltip && showTooltipState}>
					<TooltipTrigger asChild>
						<SliderPrimitive.Thumb
							className="block relative h-4 w-4 rounded-full border-2 border-foreground shadow-md bg-background cursor-pointer ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
							onMouseEnter={() => setShowTooltipState(true)}
							onMouseLeave={() => setShowTooltipState(false)}
						/>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p className="block w-max">{value[0]} ms</p>
					</TooltipContent>
				</Tooltip>
			</SliderPrimitive.Root>
			<span
				data-show={showTooltipState}
				className="text-xs data-[show=true]:opacity-0 opacity-100 transition-opacity delay-200"
			>
				{value?.[0]}
			</span>
		</div>
	);
});

SliderWithTooltip.displayName = "SliderWithTooltip";
export { SliderWithTooltip };
