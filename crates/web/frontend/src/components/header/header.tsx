import SettingsSheet from "@/components/settings-sheet/settings-sheet";
import ThemeButton from "@/components/theme-button/theme-button";
import type { Data } from "@/model/data";
import { memo } from "react";
import ExamplesSheet from "../examples-sheet/examples-sheet";
import StarCount from "./star-count";
import { cn } from "@/lib/utils";

interface Props {
	className?: string;
	onClickExample: (json: Data, query: Data) => void;
}

const Header = ({ className, onClickExample }: Props) => {
	return (
		<header className={cn(className, "flex items-center justify-between overflow-hidden")}>
			<div className="flex-grow basis-0 flex gap-4">
				<ExamplesSheet onClickExample={onClickExample} />
				<StarCount className="px-3" />
			</div>

			<h1 className="relative items-end text-[2.5rem]">
				<span className="font-semibold text-foreground">
					GQ <span className="font-medium tracking-tight">Playground</span>
				</span>
			</h1>

			<div className="flex justify-end flex-grow basis-0 gap-4">
				<ThemeButton />
				<SettingsSheet />
			</div>
		</header>
	);
};

export default memo(Header);
