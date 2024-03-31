import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ActionButton from "../action-button/action-button";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/providers/settings-provider";
import { ContextMenuSeparator } from "../ui/context-menu";
import { Input } from "../ui/input";

interface Props {
  className?: string;
}

const SettingsSheet = ({ className }: Props) => {
  const { settings, setSettings } = useSettings();

  return (
    <Sheet>
      <SheetTrigger className={className} asChild>
        <ActionButton description="Show playground settings">
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
        <ContextMenuSeparator />
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <Label htmlFor="auto-apply" className="text-md">
              Auto apply
            </Label>
            <Switch
              defaultChecked
              id="auto-apply"
              checked={settings.autoApply}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, autoApply: checked })
              }
            />
          </div>
          <div className="ml-4">
            <Input
              id="debounce-time"
              disabled={!settings.autoApply}
              type="number"
              value={settings.debounceTime}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  debounceTime: Number(e.target.value),
                })
              }
            />
            <Label
              htmlFor="debounce-time"
              variant={settings.autoApply ? "default" : "disabled"}
            >
              Debounce time (ms)
            </Label>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
