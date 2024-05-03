import SettingsSheet from "@/components/settings-sheet/settings-sheet";
import ThemeButton from "@/components/theme-button/theme-button";
import { Badge } from "@/components/ui/badge";
import ExamplesSheet from "../examples-sheet/examples-sheet";

interface Props {
	onClickExample: (json: string, query: string) => void;
}

const Header = ({ onClickExample }: Props) => {
	return (
		<header className="w-full px-8 flex items-center justify-between mb-8">
			<ExamplesSheet onClickExample={onClickExample} />
			<h1 className="relative items-end text-5xl font-extrabold">
				<span className="font-serif">
					GQ <span className="font-normal">Playground</span>
				</span>
				<Badge variant="secondary" className="absolute left-full bottom-4 ml-4">
					beta
				</Badge>
			</h1>

			<div className="flex gap-4">
				<ThemeButton />
				<SettingsSheet />
			</div>
		</header>
	);
};

export default Header;
