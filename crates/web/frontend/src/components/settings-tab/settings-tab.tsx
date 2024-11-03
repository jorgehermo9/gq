import ActionButton from "@/components/action-button/action-button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
	setAutoApply,
	setDataTabSize,
	setDebounceTime,
	setFormatOnImport,
	setQueryTabSize,
} from "@/model/settings";
import { useSettings } from "@/providers/settings-provider";
import type { HTMLAttributes } from "react";
import { SidebarContent, SidebarDescription, SidebarHeader, SidebarTitle } from "../ui/sidebar";

const SettingsTab = ({ className }: HTMLAttributes<HTMLButtonElement>) => {
	const {
		settings: { autoApplySettings, formattingSettings },
		setSettings,
	} = useSettings();

	return (
		<SidebarContent className={className}>
			<SidebarHeader className="border-b">
				<SidebarTitle>Settings</SidebarTitle>
				<SidebarDescription>Configure the playground settings to your liking</SidebarDescription>
			</SidebarHeader>
			<div className="flex flex-col p-6 border-b">
				<div className="flex gap-4 items-center mb-4">
					<Label htmlFor="auto-apply" className="text-sm font-semibold cursor-pointer">
						Auto apply
					</Label>
					<Switch
						id="auto-apply"
						checked={autoApplySettings.autoApply}
						onCheckedChange={(checked) => setSettings((prev) => setAutoApply(prev, checked))}
					/>
				</div>
				<Label
					htmlFor="debounce-time"
					variant={autoApplySettings.autoApply ? "default" : "disabled"}
					className="mb-3 text-xs"
				>
					Debounce time
				</Label>
				<Slider
					id="debounce-time"
					disabled={!autoApplySettings.autoApply}
					onValueChange={(value) => setSettings((prev) => setDebounceTime(prev, value[0]))}
					value={[autoApplySettings.debounceTime]}
					max={5000}
					min={0}
					step={250}
					units="ms"
				/>
			</div>
			<div className="flex flex-col gap-4 w-full p-6 border-b">
				<h2 className="text-sm font-semibold">Indentation</h2>
				<div className="flex gap-8">
					<div className="flex flex-col gap-2">
						<Label className="text-xs" htmlFor="json-tab-size">
							Data indent
						</Label>
						<Select
							value={formattingSettings.dataTabSize.toString()}
							onValueChange={(value) => setSettings((prev) => setDataTabSize(prev, Number(value)))}
						>
							<SelectTrigger className="w-24 h-8">
								<SelectValue id="json-tab-size" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Tab size</SelectLabel>
									<SelectItem value="0">0</SelectItem>
									<SelectItem value="2">2</SelectItem>
									<SelectItem value="4">4</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2">
						<Label className="text-xs" htmlFor="query-tab-size">
							Query indent
						</Label>
						<Select
							value={formattingSettings.queryTabSize.toString()}
							onValueChange={(value) => setSettings((prev) => setQueryTabSize(prev, Number(value)))}
						>
							<SelectTrigger className="w-24 h-8">
								<SelectValue id="query-tab-size" />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Tab size</SelectLabel>
									<SelectItem value="0">0</SelectItem>
									<SelectItem value="2">2</SelectItem>
									<SelectItem value="4">4</SelectItem>
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-4 w-full p-6">
				<div className="flex gap-4 items-center">
					<Label htmlFor="format-on-import" className="text-sm font-semibold cursor-pointer">
						Format on import
					</Label>
					<Switch
						id="format-on-import"
						checked={formattingSettings.formatOnImport}
						onCheckedChange={(checked) => setSettings((prev) => setFormatOnImport(prev, checked))}
					/>
				</div>
			</div>
		</SidebarContent>
	);
};

export default SettingsTab;
