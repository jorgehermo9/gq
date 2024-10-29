import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { capitalize } from "@/lib/utils";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import ActionButton from "../action-button/action-button";

interface Props {
	className?: string;
}

const ThemeButton = ({ className }: Props) => {
	const { themes, theme: currentTheme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ActionButton
					className={className}
					variant="subtle"
					description="Change color theme"
					side="right"
				>
					<SunIcon className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<MoonIcon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				</ActionButton>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="right">
				<DropdownMenuLabel>Color theme</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value={currentTheme} onValueChange={setTheme}>
					{themes.map((theme) => (
						<DropdownMenuRadioItem key={theme} value={theme}>
							{capitalize(theme)}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ThemeButton;
