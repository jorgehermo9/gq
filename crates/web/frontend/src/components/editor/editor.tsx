"use client";

import CodeMirror from "@uiw/react-codemirror";
import { langs } from "@uiw/codemirror-extensions-langs";
import { gqTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Clipboard } from "lucide-react";
import { toast } from "sonner";

interface Props {
  className?: string;
  value: string;
  onChange?: (value: string) => void;
  title: string;
  editable?: boolean;
}

const Editor = ({ className, value, onChange, title, editable }: Props) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-lg font-smibold">{title}</h2>
      <CodeMirror
        className="relative h-full rounded-lg overflow-hidden border border-accent"
        value={value}
        onChange={(value, _) => onChange?.(value)}
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
        <Button
          className="absolute z-10 top-4 right-4"
          variant="outline"
          size="icon"
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
        </Button>
      </CodeMirror>
    </div>
  );
};

export default Editor;
