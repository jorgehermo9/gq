import SettingsSheet from "@/components/settings-sheet/settings-sheet";
import ThemeButton from "@/components/theme-button/theme-button";
import { cn } from "@/lib/utils";
import type { Data } from "@/model/data";
import { memo } from "react";
import ExamplesSheet from "../examples-sheet/examples-sheet";
import SharePopover from "../share-popover/share-popover";
import ShortcutPopup from "../shortcut-popup/shortcut-popup";
import StarCount from "../star-count/star-count";

interface Props {
	className?: string;
	onClickExample: (json: Data, query: Data) => void;
	inputContent: string;
	queryContent: string;
	shareLink: string | undefined;
	setShareLink: (shareLink?: string) => void;
}

const Header = ({
	className,
	onClickExample,
	inputContent,
	queryContent,
	shareLink,
	setShareLink,
}: Props) => {
	return (
		<header className={cn(className, "flex items-center justify-between")}>
			<div className="flex-grow basis-0 flex gap-4">
				<ExamplesSheet onClickExample={onClickExample} />
				<ShortcutPopup />
				<StarCount className="px-3" />
			</div>

			<h1 className="relative">
				<span className="font-semibold text-foreground text-[2.5rem]">
					GQ <span className="font-medium tracking-tight">Playground</span>
				</span>
			</h1>

			<div className="flex justify-end flex-grow basis-0 gap-4">
				<SharePopover
					inputContent={inputContent}
					queryContent={queryContent}
					shareLink={shareLink}
					setShareLink={setShareLink}
				/>
				<ThemeButton />
				<SettingsSheet />
			</div>
		</header>
	);
};

export default memo(Header);
