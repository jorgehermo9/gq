"use client";

import Editor from "@/components/editor/editor";
import { Badge } from "@/components/ui/badge";
import { useCallback, useEffect, useState } from "react";
import ApplyButton from "@/components/apply-button/apply-button";
import SettingsSheet from "@/components/settings-sheet/settings-sheet";
import { useSettings } from "@/providers/settings-provider";
import useDebounce from "@/hooks/useDebounce";
import useGq from "@/hooks/useGq";
import { toast } from "sonner";
import FileType from "@/model/file-type";
import Terminal from "@/components/terminal/terminal";
import Header from "@/components/header/header";

const Home = () => {
  const [inputJson, setInputJson] = useState<string>('{"test": 1213}');
  const [inputQuery, setInputQuery] = useState<string>("{}");
  const [outputJson, setOutputJson] = useState<string>("");
  const {
    settings: { autoApply, debounceTime, jsonTabSize },
  } = useSettings();
  const gqWorker = useGq();

  const updateOutputJson = useCallback(
    (notify: boolean) => {
      if (!gqWorker) return;
      if (!notify) {
        gqWorker
          .postMessage({
            query: inputQuery,
            json: inputJson,
            indent: jsonTabSize,
          })
          .then(setOutputJson)
          .catch((err) => toast.error(err.message, { duration: 5000 }));
        return;
      }
      const toastId = toast.loading("Applying query to JSON...");
      gqWorker
        .postMessage({
          query: inputQuery,
          json: inputJson,
          indent: jsonTabSize,
        })
        .then((res) => {
          toast.success("Query applied to JSON", { id: toastId });
          setOutputJson(res);
        })
        .catch((err) =>
          toast.error(err.message, { id: toastId, duration: 5000 })
        );
    },
    [inputJson, inputQuery, gqWorker, jsonTabSize]
  );

  useDebounce(() => autoApply && updateOutputJson(true), debounceTime, [
    inputJson,
    inputQuery,
  ]);

  return (
    <main className="flex flex-col items-center p-8 h-screen">
      <Header />
      <section className="mt-4 flex gap-8 items-center justify-center w-full h-[80vh]">
        <aside className="w-[44vw] h-[80vh] flex flex-col gap-8">
          <Editor
            className="w-[44vw] h-[40vh] max-h-[40vh]"
            value={inputJson}
            onChange={setInputJson}
            title="Input JSON"
            filename="data"
            fileType={FileType.JSON}
          />
          <Editor
            className="w-[44vw] h-[40vh] max-h-[40vh]"
            value={inputQuery}
            onChange={setInputQuery}
            title="Input Query"
            filename="query"
            fileType={FileType.GQ}
          />
        </aside>
        <ApplyButton
          autoApply={autoApply}
          onClick={() => updateOutputJson(true)}
        />
        <aside className="w-[44vw] h-[80vh] flex flex-col">
          <Editor
            className="w-[44vw] h-[80vh]"
            value={outputJson}
            onChange={setOutputJson}
            title="Output JSON"
            editable={false}
            filename="output"
            fileType={FileType.JSON}
          />
        </aside>
      </section>
    </main>
  );
};

export default Home;
