"use client";

import Editor from "@/components/editor/editor";
import { Badge } from "@/components/ui/badge";
import { useCallback, useEffect, useRef, useState } from "react";
import ApplyButton from "@/components/apply-button/apply-button";
import { js_beautify as format } from "js-beautify";
import SettingsSheet from "@/components/settings-sheet/settings-sheet";
import { useSettings } from "@/providers/settings-provider";
import useDebounce from "@/hooks/useDebounce";
import useWorker from "@/hooks/useWorker";

const Home = () => {
  const [inputJson, setInputJson] = useState<string>('{"test": 1213}');
  const [inputQuery, setInputQuery] = useState<string>("{}");
  const [outputJson, setOutputJson] = useState<string>("");
  const { settings } = useSettings();

  const receiveMessage = useCallback(
    (event: MessageEvent<string>) => setOutputJson(event.data),
    []
  );

  const worker = useWorker(receiveMessage);

  const updateOutputJson = useCallback(
    (notify: boolean) => {
      if (!notify) {
        worker?.postMessage({ query: inputQuery, json: inputJson });
        return;
      }
      // const toastId = toast.loading("Applying query to JSON...");
      worker?.postMessage({ query: inputQuery, json: inputJson });
      // toast.success("Query applied to JSON", { id: toastId });
    },
    [inputJson, inputQuery, worker]
  );

  useDebounce(() => settings.autoApply && updateOutputJson(true), 1000, [
    inputJson,
    inputQuery,
  ]);

  return (
    <main className="flex flex-col items-center p-8 h-screen">
      <div className="w-full flex items-center justify-center">
        <h1 className="mx-auto flex gap-4 pb-4 items-end text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
          GQ Playground{" "}
          <Badge variant="secondary" className="mb-2">
            beta
          </Badge>
        </h1>
        <SettingsSheet />
      </div>

      <section className="mt-4 flex gap-8 items-center justify-center w-full h-[80vh]">
        <aside className="w-[44vw] h-[80vh] flex flex-col gap-4">
          <Editor
            className="w-[44vw] h-[40vh] max-h-[40vh]"
            value={inputJson}
            onChange={setInputJson}
            title="Input JSON"
          />
          <Editor
            className="w-[44vw] h-[40vh] max-h-[40vh]"
            value={inputQuery}
            onChange={setInputQuery}
            title="Input Query"
          />
        </aside>
        <ApplyButton
          autoApply={settings.autoApply}
          onClick={() => updateOutputJson(true)}
        />
        <aside className="w-[44vw] h-[80vh] flex flex-col">
          <Editor
            className="w-[44vw] h-[80vh]"
            value={outputJson}
            title="Output JSON"
            editable={false}
          />
        </aside>
      </section>
    </main>
  );
};

export default Home;
