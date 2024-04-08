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
import { Separator } from "@/components/ui/separator";
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
	setDebounceTime,
	setJsonTabSize,
	setQueryTabSize,
} from "@/model/settings";
import { useSettings } from "@/providers/settings-provider";
import { Settings } from "lucide-react";

interface Props {
	className?: string;
}

const SettingsSheet = ({ className }: Props) => {
	const {
		settings: { autoApplySettings, formattingSettings },
		setSettings,
	} = useSettings();

	return (
		<Sheet>
			<SheetTrigger className={className} asChild>
				<ActionButton description="Show playground settings" className="p-3">
					<Settings className="w-5 h-5" />
				</ActionButton>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Settings</SheetTitle>
					<SheetDescription>
						Configure the playground settings to your liking.
					</SheetDescription>
				</SheetHeader>
				<Separator />
				<div className="flex flex-col gap-4">
					<div className="flex gap-4 items-center">
						<Label
							htmlFor="auto-apply"
							className="text-md font-semibold cursor-pointer"
						>
							Auto apply
						</Label>
						<Switch
							defaultChecked
							id="auto-apply"
							checked={autoApplySettings.autoApply}
							onCheckedChange={(checked) =>
								setSettings((prev) => setAutoApply(prev, checked))
							}
						/>
					</div>
					<div className="ml-4">
						<Label
							htmlFor="debounce-time"
							variant={autoApplySettings.autoApply ? "default" : "disabled"}
						>
							Debounce time (ms)
						</Label>
						<Slider
							id="debounce-time"
							disabled={!autoApplySettings.autoApply}
							onValueChange={(value) =>
								setSettings((prev) => setDebounceTime(prev, value[0]))
							}
							value={[autoApplySettings.debounceTime]}
							max={5000}
							min={0}
							step={250}
						/>
					</div>
				</div>
				<Separator />
				<div className="flex flex-col gap-4 w-full">
					<h2 className="text-md font-semibold">Formatting</h2>
					<div className="flex gap-8 ml-4">
						<div className="flex flex-col gap-2">
							<Label htmlFor="json-tab-size">JSON indent</Label>
							<Select
								value={formattingSettings.jsonTabSize.toString()}
								onValueChange={(value) =>
									setSettings((prev) => setJsonTabSize(prev, Number(value)))
								}
							>
								<SelectTrigger className="w-24">
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
							<Label htmlFor="query-tab-size">Query indent</Label>
							<Select
								value={formattingSettings.queryTabSize.toString()}
								onValueChange={(value) =>
									setSettings((prev) => setQueryTabSize(prev, Number(value)))
								}
							>
								<SelectTrigger className="w-24">
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
			</SheetContent>
		</Sheet>
	);
};

export default SettingsSheet;
