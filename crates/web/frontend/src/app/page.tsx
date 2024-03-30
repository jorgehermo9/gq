"use client";

import Editor from "@/components/editor/editor";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import init, { gq } from "gq-web";
import ApplyButton from "@/components/apply-button/apply-button";
import { Settings } from "lucide-react";
import SettingsSheet from "@/components/settings-sheet/settings-sheet";

const Home = dynamic(async () => {
  await init();

  const HomeComponent = () => {
    const [inputJson, setInputJson] = useState<string>('{"test": 1213}');
    const [inputQuery, setInputQuery] = useState<string>("{}");
    const [outputJson, setOutputJson] = useState<string>("");
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
    const [autoApply, setAutoApply] = useState<boolean>(true);

    useEffect(() => {
      timer && clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          setOutputJson(gq(inputQuery, inputJson));
        }, 500)
      );
    }, [inputJson, inputQuery]);

    return (
      <main className="flex flex-col items-center p-8 h-screen">
        <div className="w-full flex items-center justify-center">
          <h1 className="ml-auto flex gap-4 pb-4 items-end text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
            GQ Playground{" "}
            <Badge variant="secondary" className="mb-2">
              beta
            </Badge>
          </h1>
          <SettingsSheet className="ml-auto" />
        </div>

        <section className="mt-4 flex gap-4 items-center w-full h-[48rem]">
          <aside className="w-1/2 h-[48rem] flex flex-col gap-4">
            <Editor
              className="h-[24rem] max-h-[24rem]"
              value={inputJson}
              onChange={setInputJson}
              title="Input JSON"
            />
            <Editor
              className="h-[24rem] max-h-[24rem]"
              value={inputQuery}
              onChange={setInputQuery}
              title="Input Query"
            />
          </aside>
          <ApplyButton autoApply={autoApply} />
          <aside className="w-1/2 h-[48rem] flex flex-col">
            <Editor
              className="h-[48rem]"
              value={outputJson}
              title="Output JSON"
              editable={false}
            />
          </aside>
        </section>
      </main>
    );
  };
  HomeComponent.displayName = "Home";
  return HomeComponent;
});

export default Home;
