import SettingsSheet from "@/components/settings-sheet/settings-sheet";
import ThemeButton from "@/components/theme-button/theme-button";
import type { Data } from "@/model/data";
import { memo } from "react";
import ExamplesSheet from "../examples-sheet/examples-sheet";
import StarCount from "./star-count";

interface Props {
	onClickExample: (json: Data, query: Data) => void;
}

const Header = ({ onClickExample }: Props) => {
	return (
		<header className="w-full px-8 flex items-center justify-between mb-8">
			<div className="flex-grow basis-0">
				<ExamplesSheet onClickExample={onClickExample} />
			</div>

			<h1 className="relative items-end text-5xl">
				<span className="font-semibold">
					GQ <span className="tracking-tight">Playground</span>
				</span>
				<StarCount className="absolute left-full bottom-0 ml-8" />
				{/* <Badge variant="secondary" className="absolute left-full bottom-2 ml-4">
					beta
				</Badge> */}
			</h1>

			<div className="flex justify-end flex-grow basis-0 gap-4">
				<ThemeButton />
				<SettingsSheet />
			</div>
		</header>
	);
};

export default memo(Header);
