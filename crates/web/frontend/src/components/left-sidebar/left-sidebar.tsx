import { useOnboarding } from "@/hooks/use-onboarding";
import { cn, isMac } from "@/lib/utils";
import type { Data } from "@/model/data";
import type FileType from "@/model/file-type";
import { Book, History, Settings, Share } from "lucide-react";
import { type MutableRefObject, useCallback, useEffect, useState } from "react";
import ActionButton from "../action-button/action-button";
import ExamplesTab from "../examples-tab/examples-tab";
import HistoryTab from "../history-tab/history-tab";
import SettingsTab from "../settings-tab/settings-tab";
import ShareTab from "../share-tab/share-tab";
import ThemeButton from "../theme-button/theme-button";

type Tab = "examples" | "share" | "history" | "settings";

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
	className?: string;
	onClickExample: (json: Data, query: Data) => void;
	onClickQuery: (queryContent: string) => void;
	addNewQueryCallback: MutableRefObject<(queryContent: string) => void>;
	inputContent: MutableRefObject<string>;
	inputType: MutableRefObject<FileType>;
	queryContent: MutableRefObject<string>;
	outputType: MutableRefObject<FileType>;
	shareLink: string | undefined;
	setShareLink: (shareLink?: string) => void;
}

export const LeftSidebar = ({
	open,
	setOpen,
	onClickExample,
	onClickQuery,
	addNewQueryCallback,
	inputContent,
	inputType,
	queryContent,
	outputType,
	shareLink,
	setShareLink,
}: Props) => {
	const [selectedTab, setSelectedTab] = useState<Tab>("examples");
	const [OnboardingComponent, isOnboardingVisible, dismissOnboarding] = useOnboarding();

	const handleChangeOpen = useCallback(
		(value: boolean) => {
			setOpen(value);
			dismissOnboarding();
		},
		[setOpen, dismissOnboarding],
	);

	const handleClick = useCallback(
		(tab: Tab) => {
			setSelectedTab(tab);
			open && tab === selectedTab ? handleChangeOpen(false) : handleChangeOpen(true);
		},
		[open, handleChangeOpen, selectedTab],
	);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if ((isMac ? e.metaKey : e.ctrlKey) && (e.key === "b" || e.key === "B")) {
				e.preventDefault();
				handleChangeOpen(!open);
			}
		},
		[open, handleChangeOpen],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	return (
		<div className="flex bg-background">
			<div className="h-full w-16 flex flex-col items-center justify-between border-r">
				<div className="flex flex-col w-full relative">
					<ActionButton
						className={cn("w-full h-12", selectedTab === "share" && "bg-muted")}
						description="Share your playground"
						variant="subtle"
						side="right"
						onClick={() => handleClick("share")}
					>
						<Share
							className={cn("w-4 h-4 transition-opacity", selectedTab !== "share" && "opacity-80")}
						/>
					</ActionButton>
					<ActionButton
						className={cn("w-full h-12", selectedTab === "history" && "bg-muted")}
						description="Show query history"
						variant="subtle"
						side="right"
						onClick={() => handleClick("history")}
					>
						<History
							className={cn(
								"w-4 h-4 transition-opacity",
								selectedTab !== "history" && "opacity-80",
							)}
						/>
					</ActionButton>
					<ActionButton
						className={cn(
							"w-full h-12",
							selectedTab === "examples" && "bg-muted",
							isOnboardingVisible && "border-y border-accent",
						)}
						side="right"
						description="Show query examples"
						variant="subtle"
						onClick={() => handleClick("examples")}
					>
						<Book
							className={cn(
								"w-4 h-4 transition-opacity",
								selectedTab !== "examples" && "opacity-80",
							)}
						/>
					</ActionButton>

					<OnboardingComponent className="absolute left-full top-24 -translate-y-1/4 z-20 w-80" />
				</div>
				<div className="flex flex-col w-full">
					<ThemeButton className="w-full h-12" />
					<ActionButton
						className={cn("w-full h-12", selectedTab === "settings" && "bg-muted")}
						side="right"
						description="Show playground settings"
						variant="subtle"
						onClick={() => handleClick("settings")}
					>
						<Settings
							className={cn(
								"w-4 h-4 transition-opacity",
								selectedTab !== "settings" && "opacity-80",
							)}
						/>
					</ActionButton>
				</div>
			</div>
			<div
				className={`${open ? "max-w-96 border-r" : "max-w-0 border-0"} transition-all overflow-hidden`}
			>
				<div className="w-96 h-full overflow-y-auto overflow-x-hidden">
					<ShareTab
						className={cn(selectedTab === "share" ? "block" : "hidden")}
						inputContent={inputContent}
						inputType={inputType}
						queryContent={queryContent}
						outputType={outputType}
						shareLink={shareLink}
						setShareLink={setShareLink}
					/>
					<HistoryTab
						className={cn(selectedTab === "history" ? "block" : "hidden")}
						onClickQuery={onClickQuery}
						addNewQueryCallback={addNewQueryCallback}
					/>
					<ExamplesTab
						className={cn(selectedTab === "examples" ? "block" : "hidden")}
						onClickExample={onClickExample}
					/>
					<SettingsTab className={cn(selectedTab === "settings" ? "block" : "hidden")} />
				</div>
			</div>
		</div>
	);
};

export default LeftSidebar;
