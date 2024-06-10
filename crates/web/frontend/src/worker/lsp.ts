import type { Completion } from "@/model/completion";
import { type Data, dataToDTO } from "@/model/data";
import init, { completions, type JsCompletionItem } from "gq-web";
import registerWebworker from "webworker-promise/lib/register";

interface Message {
    query: string;
    position: number;
    trigger: string;
    data: Data;
}

registerWebworker(async ({ query, position, trigger, data }: Message) => {
    await init();
    const completion = completions(query, position, trigger, dataToDTO(data));
    return completion.map((item: JsCompletionItem) => ({
        label: item.label,
        detail: item.detail,
    })) as Completion[];
});
