import { cn, copyToClipboard } from "@/lib/utils";
import type { ExpirationTime } from "@/model/expiration-time";
import { Clipboard, Clock, InfoIcon, Share } from "lucide-react";
import { useCallback, useState } from "react";
import ActionButton from "../action-button/action-button";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "../ui/popover";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { Loader } from "../ui/sonner";
import { createShareLink } from "./share-popover-utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface SharePopoverProps {
	inputContent: string;
	queryContent: string;
	shareLink: string | undefined;
	setShareLink: (shareLink?: string) => void;
}

const SharePopover = ({
	inputContent,
	queryContent,
	shareLink,
	setShareLink,
}: SharePopoverProps) => {
	const [expirationTime, setExpirationTime] = useState<ExpirationTime>("1 hour");
	const [selectedExpirationTime, setSelectedExpirationTime] = useState<ExpirationTime>();
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			setIsLoading(true);
			const shareLink = await createShareLink(inputContent, queryContent, expirationTime);
			setIsLoading(false);
			if (!shareLink) return;
			setShareLink(shareLink);
			setSelectedExpirationTime(expirationTime);
		},
		[expirationTime, setShareLink, inputContent, queryContent],
	);

	const handleChangeExpirationTime = useCallback(
		(value: string) => {
			setShareLink(undefined);
			setExpirationTime(value as ExpirationTime);
		},
		[setShareLink],
	);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<ActionButton description="Share your playground" className="p-3 border-accent-subtle">
					<Share className="w-4 h-4" />
				</ActionButton>
			</PopoverTrigger>
			<PopoverContent className="w-[22rem] max-w-[80vw] max-h-[80vh] gap-0 relative right-2">
				<PopoverHeader>
					<div className="flex items-center gap-2">
						<PopoverTitle>Share your playground</PopoverTitle>
						<Tooltip>
							<TooltipTrigger asChild>
								<InfoIcon className="w-3 h-3" />
							</TooltipTrigger>
							<TooltipContent className="w-96 font-normal p-4" side="left">
								<span>
									When generating a sharable link,{" "}
									<span className="font-semibold">
										the content of the input json and the query will be saved in the server
									</span>{" "}
									until the expiration time is reached
								</span>
							</TooltipContent>
						</Tooltip>
					</div>
					<PopoverDescription>
						Create a shareable link to your current playground state
					</PopoverDescription>
				</PopoverHeader>
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
					<div className="animate-in slide-in-from-bottom-4 fade-in-10 duration-300">
						<Separator />
						<Label htmlFor="generated-link" variant="default">
							Generated link
						</Label>
						<div className="w-full flex mt-2">
							<Input
								readOnly
								id="generated-link"
								className="mb-0 rounded-r-none border-r-0"
								value={shareLink}
							/>
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

export default SharePopover;
