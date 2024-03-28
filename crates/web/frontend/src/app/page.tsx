"use client";

import Editor from "@/components/editor/editor";
import { useState } from "react";

export default function Home() {
  const [inputJson, setInputJson] = useState<string>("{'test': 1213}");
  const [inputQuery, setInputQuery] = useState<string>("query { test }");
  const [outputJson, _] = useState<string>("{'test': 1213}");

  return (
    <main className="flex flex-col items-center p-8 h-screen">
      <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
        GQ PLAYGROUND
      </h1>
      <section className="mt-8 flex gap-8 w-full h-full">
        <aside className="w-1/2 h-full flex flex-col gap-8">
          <Editor
            className="h-1/2"
            value={inputJson}
            onChange={setInputJson}
            title="Input JSON"
          />
          <Editor
            className="h-1/2"
            value={inputQuery}
            onChange={setInputQuery}
            title="Input Query"
          />
        </aside>
        <aside className="w-1/2 h-full flex flex-col">
          <Editor className="h-full" value={outputJson} title="Output JSON" editable={false} />
        </aside>
      </section>
    </main>
  );
}
