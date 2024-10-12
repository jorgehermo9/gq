import { Clipboard, ClipboardCopy, ClipboardIcon, InfoIcon, Share, X } from "lucide-react";
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
import { Input } from "../ui/input";
import { copyToClipboard } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const SharePopup = () => {
	const [expirationTime, setExpirationTime] = useState(3600);
	const [shareLink, setShareLink] = useState(
		"https://gq.hermo.dev/3c8ec511-754f-4e19-ade1-62974d745106",
	);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
	};

	const handleExpirationTimeChange = (value: number[]) => {
		setExpirationTime(value[0]);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<ActionButton description="Share your playground" className="p-3 border-accent-subtle">
					<Share className="w-4 h-4" />
				</ActionButton>
			</PopoverTrigger>
			<PopoverContent
				
				className="w-[26rem] max-w-[80vw] max-h-[80vh] gap-0 relative right-2"
			>
				<div className="flex items-center mb-1.5">
					<TooltipProvider>
						<h4 className="text-lg font-semibold leading-none tracking-tight">
							Share your playground
						</h4>
						<Tooltip>
							<TooltipTrigger asChild>
								<InfoIcon className="w-3 h-3 ml-2 mt-1" />
							</TooltipTrigger>
							<TooltipContent className="w-1/2 font-normal p-4">
								<span>
									When generating a sharable link,{" "}
									<span className="font-semibold">
										the content of the input json and the query will be saved in our servers
									</span>{" "}
									until the expiration time is reached
								</span>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<span className="text-sm">Create a shareable link to your current playground state</span>
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

					<div className="mt-8 w-full flex">
						<Input readOnly className="mb-0 rounded-r-none border-r-0" value={shareLink} />
						<ActionButton
							className="px-4 py-2 h-10 rounded-l-none"
							description="Copy to clipboard"
							variant="outline"
							onClick={() => copyToClipboard(shareLink)}
						>
							<Clipboard className="w-3.5 h-3.5" />
						</ActionButton>
					</div>
					<Button className="mt-8 w-full py-1 px-8" variant="outline" type="submit">
						Generate link
					</Button>
				</form>
			</PopoverContent>
		</Popover>
	);
};

export default SharePopup;
