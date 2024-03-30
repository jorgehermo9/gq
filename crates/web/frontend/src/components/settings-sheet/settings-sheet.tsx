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

interface Props {
  className?: string;
}

const SettingsSheet = ({ className }: Props) => {
  const { settings, setSettings } = useSettings();

  return (
    <Sheet>
      <SheetTrigger className={className} asChild>
        <ActionButton description="Show playground settings">
          <Settings />
        </ActionButton>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure the playground settings to your liking.
          </SheetDescription>
        </SheetHeader>
        <div className="flex gap-4 items-center">
          <Switch
            defaultChecked
            id="auto-apply"
            checked={settings.autoApply}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, autoApply: checked })
            }
          />
          <Label htmlFor="auto-apply">Enable auto apply</Label>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsSheet;
