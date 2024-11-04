import { cn, copyToClipboard } from "@/lib/utils";
import type { ExpirationTime } from "@/model/expiration-time";
import type FileType from "@/model/file-type";
import { Clipboard, Clock, InfoIcon } from "lucide-react";
import { type MutableRefObject, useCallback, useState } from "react";
import ActionButton from "../action-button/action-button";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { SidebarContent, SidebarDescription, SidebarHeader, SidebarTitle } from "../ui/sidebar";
import { Loader } from "../ui/sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { createShareLink } from "./share-tab-utils";

interface ShareTabProps {
	inputContent: MutableRefObject<string>;
	inputType: MutableRefObject<FileType>;
	queryContent: MutableRefObject<string>;
	outputType: MutableRefObject<FileType>;
	shareLink: string | undefined;
	setShareLink: (shareLink?: string) => void;
	className?: string;
}

const ShareTab = ({
	inputContent,
	inputType,
	queryContent,
	outputType,
	shareLink,
	setShareLink,
	className,
}: ShareTabProps) => {
	const [expirationTime, setExpirationTime] = useState<ExpirationTime>("1 hour");
	const [selectedExpirationTime, setSelectedExpirationTime] = useState<ExpirationTime>();
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			setIsLoading(true);
			const shareLink = await createShareLink(
				inputContent.current,
				inputType.current,
				queryContent.current,
				outputType.current,
				expirationTime,
			);
			setIsLoading(false);
			if (!shareLink) return;
			setShareLink(shareLink);
			setSelectedExpirationTime(expirationTime);
		},
		[expirationTime, setShareLink, inputContent, inputType, queryContent, outputType],
	);

	const handleChangeExpirationTime = useCallback(
		(value: string) => {
			setShareLink(undefined);
			setExpirationTime(value as ExpirationTime);
		},
		[setShareLink],
	);

	return (
		<SidebarContent className={className}>
			<SidebarHeader>
				<div className="flex items-center gap-2">
					<SidebarTitle>Share your playground</SidebarTitle>
					<Tooltip>
						<TooltipTrigger asChild>
							<InfoIcon className="w-3 h-3" />
						</TooltipTrigger>
						<TooltipContent className="w-96 font-normal p-4" side="bottom">
							<p>
								When generating a sharable link,{" "}
								<strong>
									the content of the input json and the query will be saved in the server
								</strong>{" "}
								until the expiration time is reached
							</p>
						</TooltipContent>
					</Tooltip>
				</div>
				<SidebarDescription>
					Create a shareable link to your current playground state
				</SidebarDescription>
			</SidebarHeader>
			<form onSubmit={handleSubmit} autoComplete="off" className="overflow-x-auto mt-4">
				<div className="px-6">
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
							<Label className="pl-2 cursor-pointer" htmlFor="1-hour">
								1 hour
							</Label>
						</div>
						<div className="flex items-center">
							<RadioGroupItem value="1 day" id="1-day" />
							<Label className="pl-2 cursor-pointer" htmlFor="1-day">
								1 day
							</Label>
						</div>
						<div className="flex items-center">
							<RadioGroupItem value="1 week" id="1-week" />
							<Label className="pl-2 cursor-pointer" htmlFor="1-week">
								1 week
							</Label>
						</div>
					</RadioGroup>
				</div>

				<Button
					className={cn("mt-8 w-full py-1 px-8 border-x-0", isLoading && "!opacity-100")}
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
				<div className="animate-in slide-in-from-bottom-4 fade-in-10 duration-300 mt-4">
					<Label className="px-6" htmlFor="generated-link" variant="default">
						Generated link
					</Label>
					<div className="w-full flex mt-2">
						<Input
							readOnly
							id="generated-link"
							className="mb-0 rounded-r-none border-x-0"
							value={shareLink}
						/>
						<ActionButton
							className="px-4 py-2 h-10 border-r-0"
							description="Copy to clipboard"
							variant="outline"
							onClick={() => copyToClipboard(shareLink)}
						>
							<Clipboard className="w-3 h-3" />
						</ActionButton>
					</div>
					<div className="flex items-center gap-2 mt-4 px-6">
						<Clock className="w-2.5 h-2.5 mt-[2px]" />
						<span className="text-xs">Your link will expire in {selectedExpirationTime}</span>
					</div>
				</div>
			)}
		</SidebarContent>
	);
};

export default ShareTab;
