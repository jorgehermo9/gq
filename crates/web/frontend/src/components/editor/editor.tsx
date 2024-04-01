"use client";

import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import styles from "./editor.module.css";
import { useCallback, useEffect, useState } from "react";
import useFormat from "@/hooks/useFormat";
import EditorMenu from "./editor-menu";
import FileType from "@/model/file-type";
import { useSettings } from "@/providers/settings-provider";

interface Props {
  value: string;
  title: string;
  filename: string;
  type: FileType;
  onChange?: (value: string) => void;
  className?: string;
  editable?: boolean;
}

const Editor = ({
  value,
  title,
  filename,
  type,
  onChange,
  className,
  editable = true,
}: Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const formatWorker = useFormat();
  const {
    settings: { indentSize },
  } = useSettings();

  const formatCode = useCallback(() => {
    const toastId = toast.loading("Formatting code...");
    formatWorker
      ?.postMessage({ data: value, indent: indentSize, type: type })
      .then((res) => onChange?.(res))
      .catch((err) => console.error(err))
      .finally(() =>
        toast.success("Code formatted!", { id: toastId, duration: 1000 })
      );
  }, [value, onChange, formatWorker, type, indentSize]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to your clipboard!");
  }, [value]);

  const exportFile = useCallback(() => {
    const blob = new Blob([value], { type: `application/${type}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.${type}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [value, filename, type]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isFocused) return;
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        formatCode();
      }
    },
    [isFocused, formatCode]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex gap-4 items-center">
        <h2 className="text-lg">
          <span className="font-smibold">{title.split(" ")[0]}</span>
          <span className="font-bold"> {title.split(" ")[1]}</span>
        </h2>
        <EditorMenu
          editable={editable}
          onCopyToClipboard={copyToClipboard}
          onFormatCode={formatCode}
          onImportFile={(value) => onChange?.(value)}
          onExportFile={exportFile}
        />
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
    </div>
  );
};

export default Editor;
