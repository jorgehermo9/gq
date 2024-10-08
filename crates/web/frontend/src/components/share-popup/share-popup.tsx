import { InfoIcon, Share, X } from "lucide-react";
import { useState } from "react";
import ActionButton from "../action-button/action-button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { SliderWithMarks } from "../ui/slider-with-marks";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Tooltip, TooltipProvider } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipTrigger } from "../ui/tooltip";

const SharePopup = () => {
	const [open, setOpen] = useState(false);
	const [expirationTime, setExpirationTime] = useState(3600);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	};

	const handleExpirationTimeChange = (value: number[]) => {
		setExpirationTime(value[0]);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<ActionButton description="Share your playground" className="p-3 border-accent-subtle">
					<Share className="w-4 h-4" />
				</ActionButton>
			</DialogTrigger>
			<DialogContent className="w-[34rem] max-w-[80vw] max-h-[80vh] gap-0">
				<X
					className="absolute top-4 right-4 h-4 w-4 cursor-pointer"
					onClick={() => setOpen(false)}
				/>
				<DialogHeader>
					<DialogTitle className="flex items-center">
						<span>Share your playground</span>
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<InfoIcon className="w-3 h-3 ml-2 mt-1" />
								</TooltipTrigger>
								<TooltipContent className="w-1/2 font-normal p-4">
									<span>
										When generating a sharable link,{" "}
										<span className="font-semibold">
											the content of the input json and the query will be saved in our servers
										</span>
										. This data won't be accessible when the expiration time is reached.
									</span>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</DialogTitle>
					<DialogDescription>
						Create a shareable link to your current playground state
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} autoComplete="off" className="overflow-x-auto mt-8">
					<div>
						<Label htmlFor="expiration-time" variant="default">
							Expiration time
						</Label>
						<RadioGroup
							className="mt-4 text-xs flex gap-4"
							defaultValue="1-day"
							id="expiration-time"
						>
							<div className="flex items-center">
								<RadioGroupItem value="1-hour" id="1-hour" />
								<Label className="pl-2" htmlFor="1-hour">
									1 hour
								</Label>
							</div>
							<div className="flex items-center">
								<RadioGroupItem value="1-day" id="1-day" />
								<Label className="pl-2" htmlFor="1-day">
									1 day
								</Label>
							</div>
							<div className="flex items-center">
								<RadioGroupItem value="1-week" id="1-week" />
								<Label className="pl-2" htmlFor="1-week">
									1 week
								</Label>
							</div>
						</RadioGroup>
					</div>
					<div className="flex justify-between mt-8">
						<Button
							className="py-1 px-8"
							variant="outline"
							onClick={() => setOpen(false)}
							type="button"
						>
							Cancel
						</Button>
						<Button className="py-1 px-8" variant="success" type="submit">
							Create
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default SharePopup;
