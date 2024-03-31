"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clipboard, EllipsisVertical, Sparkles } from "lucide-react";
import ActionButton from "../action-button/action-button";

interface Props {
  editable: boolean;
  onCopyToClipboard: () => void;
  onFormatCode: () => void;
}

const EditorMenu = ({ editable, onCopyToClipboard, onFormatCode }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-6 h-6" variant="outline" size="icon">
          <EllipsisVertical className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="right" sideOffset={8}>
        <DropdownMenuItem onClick={onCopyToClipboard}>
          <div className="flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            <span>Copy All</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onFormatCode} disabled={!editable}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Format</span>
          </div>
          <DropdownMenuShortcut>Ctrl + S</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EditorMenu;
