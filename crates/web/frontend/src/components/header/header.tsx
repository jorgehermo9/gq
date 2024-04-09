import SettingsSheet from "@/components/settings-sheet/settings-sheet";
import Terminal from "@/components/terminal/terminal";
import ThemeButton from "@/components/theme-button/theme-button";
import { Badge } from "@/components/ui/badge";

const Header = () => {
	return (
		<header className="w-full px-8 flex items-center justify-between mb-12">
			<h1 className="relative mx-auto items-end text-7xl font-extrabold">
				<span className="neuton">
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
