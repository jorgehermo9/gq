"use client";

import Editor from "@/components/editor/editor";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Home() {
  const [inputJson, setInputJson] = useState<string>("{'test': 1213}");
  const [inputQuery, setInputQuery] = useState<string>("query { test }");
  const [outputJson, _] = useState<string>("{'test': 1213}");

  return (
    <main className="flex flex-col items-center p-8 h-screen">
      <h1 className="flex gap-4 pb-4 items-end text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
        GQ Playground{" "}
        <Badge variant="secondary" className="mb-2">
          beta
        </Badge>
      </h1>
      <section className="mt-4 flex gap-8 w-full h-[48rem]">
        <aside className="w-1/2 h-[48rem] flex flex-col gap-8">
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
        <aside className="w-1/2 h-[49rem] flex flex-col">
          <Editor
            className="h-full"
            value={outputJson}
            title="Output JSON"
            editable={false}
          />
        </aside>
      </section>
    </main>
  );
}
