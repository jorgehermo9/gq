"use client";

import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Clipboard, Sparkles } from "lucide-react";
import { toast } from "sonner";
import styles from "./editor.module.css";
import { useCallback, useEffect, useState } from "react";
import useFormat from "@/hooks/useFormat";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface Props {
  className?: string;
  value: string;
  onChange?: (value: string) => void;
  title: string;
  editable?: boolean;
}

const Editor = ({
  className,
  value,
  onChange,
  title,
  editable = true,
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const formatWorker = useFormat();

  const format = useCallback(() => {
    const toastId = toast.loading("Formatting code...");
    formatWorker
      ?.postMessage(value)
      .then((res) => onChange?.(res))
      .finally(() => toast.success("Code formatted!", { id: toastId }));
  }, [value, onChange, formatWorker]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to your clipboard!");
  }, [value]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isFocused) return;
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        format();
      }
    },
    [isFocused, format]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex justify-between">
        <h2 className="text-lg">
          <span className="font-smibold">{title.split(" ")[0]}</span>
          <span className="font-bold"> {title.split(" ")[1]}</span>
        </h2>
      </div>

      <CodeMirror
        data-focus={isFocused}
        className={`${styles.editor} relative h-full rounded-lg overflow-hidden group text-sm`}
        value={value}
        onChange={(value, _) => onChange?.(value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        height="100%"
        theme={gqTheme}
        extensions={[langs.json()]}
        editable={editable}
        basicSetup={{
          lineNumbers: true,
          lintKeymap: true,
          highlightActiveLineGutter: editable,
        }}
      />

      {/* <ContextMenu>
        <ContextMenuTrigger className="h-full">
          <CodeMirror
            data-focus={isFocused}
            className={`${styles.editor} relative h-full rounded-lg overflow-hidden group text-sm`}
            value={value}
            onChange={(value, _) => onChange?.(value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            height="100%"
            theme={gqTheme}
            extensions={[langs.json()]}
            editable={editable}
            basicSetup={{
              lineNumbers: true,
              lintKeymap: true,
              highlightActiveLineGutter: editable,
            }}
          />
        </ContextMenuTrigger>

        <ContextMenuContent className="w-56">
          <ContextMenuItem onClick={copyToClipboard}>
            <div className="flex items-center gap-2">
              <Clipboard className="w-4 h-4" />
              <span>Copy All</span>
            </div>
          </ContextMenuItem>
          <ContextMenuItem onClick={format} disabled={!editable}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Format</span>
            </div>
            <ContextMenuShortcut>Ctrl + S</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu> */}
    </div>
  );
};

export default Editor;
