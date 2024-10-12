import { Clipboard, Clock, Share } from "lucide-react";
import { useState } from "react";
import ActionButton from "../action-button/action-button";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Input } from "../ui/input";
import { cn, copyToClipboard } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Separator } from "../ui/separator";
import { Loader } from "../ui/sonner";

const SharePopup = () => {
	const [expirationTime, setExpirationTime] = useState<"1 hour" | "1 day" | "1 week">("1 day");
	const [shareLink, setShareLink] = useState<string>();
	const [isLoading, setIsLoading] = useState(false);
	const [selectedExpirationTime, setSelectedExpirationTime] = useState<
		"1 hour" | "1 day" | "1 week"
	>();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
			setShareLink("https://gq.hermo.dev/test");
			setSelectedExpirationTime(expirationTime);
		}, 2000);
	};

	const handleChangeExpirationTime = (value: string) => {
		setShareLink(undefined);
		setExpirationTime(value as "1 hour" | "1 day" | "1 week");
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<ActionButton description="Share your playground" className="p-3 border-accent-subtle">
					<Share className="w-4 h-4" />
				</ActionButton>
			</PopoverTrigger>
			<PopoverContent className="w-[24rem] max-w-[80vw] max-h-[80vh] gap-0 relative right-2">
				<div className="flex items-center mb-1.5">
					<h4 className="text-lg font-semibold leading-none tracking-tight">
						Share your playground
					</h4>
					{/* TODO: Fix this */}
					{/* <TooltipProvider>
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
					</TooltipProvider> */}
				</div>
				{/* <span className="text-sm">Create a shareable link to your current playground state</span> */}
				<form onSubmit={handleSubmit} autoComplete="off" className="overflow-x-auto mt-4">
					<div>
						<Label htmlFor="expiration-time" variant="default">
							Expiration time
						</Label>
						<RadioGroup
							value={expirationTime}
							onValueChange={handleChangeExpirationTime}
							disabled={isLoading}
							className="mt-4 text-xs flex gap-4 peer"
							id="expiration-time"
						>
							<div className="flex items-center">
								<RadioGroupItem value="1 hour" id="1-hour" />
								<Label className="pl-2" htmlFor="1-hour">
									1 hour
								</Label>
							</div>
							<div className="flex items-center">
								<RadioGroupItem value="1 day" id="1-day" />
								<Label className="pl-2" htmlFor="1-day">
									1 day
								</Label>
							</div>
							<div className="flex items-center">
								<RadioGroupItem value="1 week" id="1-week" />
								<Label className="pl-2" htmlFor="1-week">
									1 week
								</Label>
							</div>
						</RadioGroup>
					</div>

					<Button
						className={cn("mt-8 w-full py-1 px-8", isLoading && "!opacity-100")}
						variant="outline"
						type="submit"
						disabled={
							isLoading || (shareLink !== undefined && expirationTime === selectedExpirationTime)
						}
					>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<Loader />
								<span>Generating</span>
							</div>
						) : (
							<span>Generate link</span>
						)}
					</Button>
				</form>
				{shareLink && (
					<div className="animate-in fade-in">
						<Separator />
						<div className="w-full flex">
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
						<div className="flex items-center gap-2 mt-4">
							<Clock className="w-2.5 h-2.5 mt-[2px]" />
							<span className="text-xs">Your link will expire in {selectedExpirationTime}</span>
						</div>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default SharePopup;
