import { Badge } from "@/components/ui/badge";
import SettingsSheet from "@/components/settings-sheet/settings-sheet";
import Terminal from "@/components/terminal/terminal";

const Header = () => {
  return (
    <header className="w-full px-8 flex items-center justify-center">
      <h1 className="mx-auto flex gap-4 pb-8 items-end text-7xl font-extrabold">
        <span className="neuton">
          GQ <span className="font-normal">Playground</span>
        </span>
        <Badge variant="secondary" className="mb-2">
          beta
        </Badge>
      </h1>
      <div className="flex gap-4">
        <Terminal />
        <SettingsSheet />
      </div>
    </header>
  );
};

export default Header;
