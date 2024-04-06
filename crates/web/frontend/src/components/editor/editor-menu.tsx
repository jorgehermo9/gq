"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clipboard,
  Download,
  DownloadCloud,
  EllipsisVertical,
  FileUp,
  Import,
  Sparkles,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import ActionButton from "../action-button/action-button";

interface Props {
  editable: boolean;
  onCopyToClipboard: () => void;
  onFormatCode: () => void;
  onImportFile: (content: string) => void;
  onExportFile: () => void;
}

const EditorMenu = ({
  editable,
  onCopyToClipboard,
  onFormatCode,
  onImportFile,
  onExportFile,
}: Props) => {
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      onImportFile(content);
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="hidden sm:flex ml-auto pr-2 items-center gap-2">
        <ActionButton
          className="w-8 h-8"
          description="Copy to clipboard"
          onClick={onCopyToClipboard}
        >
          <Clipboard className="w-4 h-4" />
        </ActionButton>
        {editable && (
          <ActionButton
            className="w-8 h-8"
            description="Format code"
            onClick={onFormatCode}
          >
            <Sparkles className="w-4 h-4" />
          </ActionButton>
        )}
        {editable && (
          <ActionButton
            className="w-8 h-8 p-0"
            description="Import file"
            hidden={!editable}
          >
            <input
              id="file-import"
              hidden
              type="file"
              accept=".json,.gq"
              onChange={handleImportFile}
            />
            <Label
              htmlFor="file-import"
              className="w-full h-full grid place-items-center cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
            </Label>
          </ActionButton>
        )}
        <ActionButton
          className="w-8 h-8"
          description="Export file"
          onClick={onExportFile}
        >
          <DownloadCloud className="w-4 h-4" />
        </ActionButton>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-6 h-6 sm:hidden" variant="outline" size="icon">
            <EllipsisVertical className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" side="right" sideOffset={8}>
          <DropdownMenuItem onClick={onCopyToClipboard}>
            <div className="flex items-center gap-2">
              <Clipboard className="w-4 h-4" />
              <span>Copy</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onFormatCode} disabled={!editable}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Format</span>
            </div>
            <DropdownMenuShortcut>Ctrl + S</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="p-0"
            disabled={!editable}
            onSelect={(e) => e.preventDefault()}
          >
            <input
              id="file-import"
              hidden
              type="file"
              accept=".json,.gq"
              onChange={handleImportFile}
            />
            <Label
              htmlFor="file-import"
              className="flex items-center gap-2 px-2 py-1.5 w-full h-full cursor-pointer text-sm font-normal"
            >
              <FileUp className="w-4 h-4" />
              <span>Import file</span>
            </Label>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportFile}>
            <div className="flex items-center gap-2">
              <DownloadCloud className="w-4 h-4" />
              <span>Export file</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default EditorMenu;
