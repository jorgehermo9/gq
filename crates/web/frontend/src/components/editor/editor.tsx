"use client";

import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Clipboard, Sparkles } from "lucide-react";
import { toast } from "sonner";
import styles from "./editor.module.css";
import { useCallback, useEffect, useState } from "react";
import { js_beautify as format } from "js-beautify";
import ActionButton from "../action-button/actionButton";

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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isFocused) return;
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        onChange?.(format(value));
      }
    },
    [value, onChange, isFocused]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-lg">
        <span className="font-smibold">{title.split(" ")[0]}</span>
        <span className="font-bold"> {title.split(" ")[1]}</span>
      </h2>
      <CodeMirror
        data-focus={isFocused}
        className={`${styles.editor} relative h-full rounded-lg overflow-hidden group`}
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
      >
        <div className="absolute z-10 top-4 right-4 flex gap-2 group-hover:opacity-100 opacity-0 transition-opacity duration-200 ">
          {editable && (
            <ActionButton
              description="Format code (Ctrl + S)"
              onClick={() => onChange?.(format(value))}
            >
              <Sparkles className="w-4 h-4" />
            </ActionButton>
          )}
          <ActionButton
            description="Copy to clipboard"
            onClick={() => {
              toast.success("Copied to your clipboard!", {
                duration: 3000,
                action: {
                  label: "Dismiss",
                  onClick: () => {},
                },
              });
              navigator.clipboard.writeText(value);
            }}
          >
            <Clipboard className="w-4 h-4" />
          </ActionButton>
        </div>
      </CodeMirror>
    </div>
  );
};

export default Editor;
